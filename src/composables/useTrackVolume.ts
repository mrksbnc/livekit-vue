import {
  isTrackReference,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import {
  createAudioAnalyser,
  Track,
  type AudioAnalyserOptions,
  type LocalAudioTrack,
  type RemoteAudioTrack,
} from 'livekit-client';
import { computed, ref, watchEffect, type MaybeRef, type Ref } from 'vue';

export type MultiBandTrackVolumeOptions = {
  bands?: number;
  /**
   * cut off of frequency bins on the lower end
   * Note: this is not a frequency measure, but in relation to analyserOptions.fftSize,
   */
  loPass?: number;
  /**
   * cut off of frequency bins on the higher end
   * Note: this is not a frequency measure, but in relation to analyserOptions.fftSize,
   */
  hiPass?: number;
  updateInterval?: number;
  analyserOptions?: AnalyserOptions;
};

export type AudioWaveformOptions = {
  barCount?: number;
  volMultiplier?: number;
  updateInterval?: number;
};

export type UseTrackVolume = {
  volume: Ref<number>;
};

export type UseMultibandTrackVolume = {
  frequencyBands: Ref<number[]>;
};

export type UseAudioWaveform = {
  bars: Ref<number[]>;
};

const multibandDefaults = {
  bands: 5,
  loPass: 100,
  hiPass: 600,
  updateInterval: 32,
  analyserOptions: { fftSize: 2048 },
} as const satisfies MultiBandTrackVolumeOptions;

const waveformDefaults = {
  barCount: 120,
  volMultiplier: 5,
  updateInterval: 20,
} as const satisfies AudioWaveformOptions;

function normalizeFrequencies(frequencies: Float32Array): Float32Array<ArrayBuffer> {
  const normalizeDb = (value: number) => {
    const minDb = -100;
    const maxDb = -10;
    let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
    db = Math.sqrt(db);

    return db;
  };

  return frequencies.map((value) => {
    if (value === -Infinity) {
      return 0;
    }
    return normalizeDb(value);
  });
}

function getFFTSizeValue(x: number): number {
  if (x < 32) return 32;
  else return pow2ceil(x);
}

function pow2ceil(v: number): number {
  let p = 2;
  while ((v >>= 1)) {
    p <<= 1;
  }
  return p;
}

function filterData(audioData: Float32Array, numSamples: number): Float32Array {
  const blockSize = Math.floor(audioData.length / numSamples); // the number of samples in each subdivision
  const filteredData = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(audioData[blockStart + j]); // find the sum of all the samples in the block
    }
    filteredData[i] = sum / blockSize; // divide the sum by the block size to get the average
  }
  return filteredData;
}

export function useTrackVolume(
  trackOrTrackReference?: MaybeRef<LocalAudioTrack | RemoteAudioTrack | TrackReference | undefined>,
  options: AudioAnalyserOptions = { fftSize: 32, smoothingTimeConstant: 0 },
): UseTrackVolume {
  const volume = ref<number>(0);

  const track = computed<LocalAudioTrack | RemoteAudioTrack | undefined>(() => {
    if (!trackOrTrackReference) {
      return undefined;
    }

    const input =
      'value' in trackOrTrackReference ? trackOrTrackReference.value : trackOrTrackReference;

    if (!input) {
      return undefined;
    }

    return isTrackReference(input)
      ? (input.publication?.track as LocalAudioTrack | RemoteAudioTrack | undefined)
      : input;
  });

  watchEffect((onCleanup) => {
    const currentTrack = track.value;
    if (!currentTrack || !currentTrack.mediaStream) {
      return;
    }

    try {
      const { cleanup, analyser } = createAudioAnalyser(currentTrack, options);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        try {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const a = dataArray[i];
            sum += a * a;
          }
          volume.value = Math.sqrt(sum / dataArray.length) / 255;
        } catch (error) {
          console.error('Error updating volume:', error);
        }
      };

      const interval = setInterval(updateVolume, 1000 / 30);

      onCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    } catch (error) {
      console.error('Error setting up audio analyzer:', error);
    }
  });

  return { volume };
}

export function useMultibandTrackVolume(
  trackOrTrackReference?: MaybeRef<
    LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder | undefined
  >,
  options: MultiBandTrackVolumeOptions = {},
): UseMultibandTrackVolume {
  const opts = { ...multibandDefaults, ...options };
  const frequencyBands = ref<number[]>(Array.from({ length: opts.bands }, () => 0));

  const track = computed<LocalAudioTrack | RemoteAudioTrack | undefined>(() => {
    if (!trackOrTrackReference) return undefined;

    const input =
      'value' in trackOrTrackReference ? trackOrTrackReference.value : trackOrTrackReference;
    return input instanceof Track
      ? input
      : (input?.publication?.track as LocalAudioTrack | RemoteAudioTrack | undefined);
  });

  watchEffect((onCleanup) => {
    const currentTrack = track.value;
    if (!currentTrack || !currentTrack.mediaStream) {
      return;
    }

    try {
      const { analyser, cleanup } = createAudioAnalyser(currentTrack, opts.analyserOptions);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const updateVolume = () => {
        try {
          analyser.getFloatFrequencyData(dataArray);

          let frequencies: Float32Array = new Float32Array(dataArray.length);

          for (let i = 0; i < dataArray.length; i++) {
            frequencies[i] = dataArray[i];
          }

          frequencies = frequencies.slice(options.loPass, options.hiPass);

          const chunks: Array<number> = [];
          const normalizedFrequencies = normalizeFrequencies(frequencies);
          const chunkSize = Math.ceil(normalizedFrequencies.length / opts.bands);

          for (let i = 0; i < opts.bands; i++) {
            const summedVolumes = normalizedFrequencies
              .slice(i * chunkSize, (i + 1) * chunkSize)
              .reduce((acc, val) => (acc += val), 0);

            chunks.push(summedVolumes / chunkSize);
          }

          frequencyBands.value = chunks;
        } catch (error) {
          console.error('Error updating frequency bands:', error);
        }
      };

      const interval = setInterval(updateVolume, opts.updateInterval);

      onCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    } catch (error) {
      console.error('Error setting up multiband audio analyzer:', error);
    }
  });

  return { frequencyBands };
}

export function useAudioWaveform(
  trackOrTrackReference?: MaybeRef<
    LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder | undefined
  >,
  options: AudioWaveformOptions = {},
): UseAudioWaveform {
  const opts = { ...waveformDefaults, ...options };

  const aggregateWave = ref<Float32Array>(new Float32Array());
  const timeRef = ref<number>(performance.now());
  const updates = ref<number>(0);
  const bars = ref<number[]>([]);

  const track = computed<LocalAudioTrack | RemoteAudioTrack | undefined>(() => {
    if (!trackOrTrackReference) return undefined;

    const input =
      'value' in trackOrTrackReference ? trackOrTrackReference.value : trackOrTrackReference;
    return input instanceof Track
      ? input
      : (input?.publication?.track as LocalAudioTrack | RemoteAudioTrack | undefined);
  });

  function onUpdate(wave: Float32Array) {
    try {
      bars.value = Array.from(
        filterData(wave, opts.barCount).map((v) => Math.sqrt(v) * opts.volMultiplier),
      );
    } catch (error) {
      console.error('Error updating waveform bars:', error);
    }
  }

  watchEffect((onCleanup) => {
    const currentTrack = track.value;
    if (!currentTrack || !currentTrack.mediaStream) {
      return;
    }

    try {
      const { analyser, cleanup } = createAudioAnalyser(currentTrack, {
        fftSize: getFFTSizeValue(opts.barCount),
      });

      const bufferLength = getFFTSizeValue(opts.barCount);
      const dataArray = new Float32Array(bufferLength);
      let animationFrame: number;

      const update = () => {
        try {
          animationFrame = requestAnimationFrame(update);
          analyser.getFloatTimeDomainData(dataArray);

          if (!aggregateWave.value || aggregateWave.value.length !== dataArray.length) {
            aggregateWave.value = new Float32Array(dataArray.length);
          }

          // Aggregate waveform data
          for (let i = 0; i < dataArray.length; i++) {
            aggregateWave.value[i] += dataArray[i];
          }

          updates.value += 1;

          // Process data at specified intervals
          if (performance.now() - timeRef.value >= opts.updateInterval) {
            const newData = new Float32Array(dataArray.length);
            for (let i = 0; i < dataArray.length; i++) {
              newData[i] = aggregateWave.value[i] / updates.value;
              aggregateWave.value[i] = 0; // Reset for next aggregation
            }

            onUpdate(newData);
            timeRef.value = performance.now();
            updates.value = 0;
          }
        } catch (error) {
          console.error('Error in waveform update:', error);
        }
      };

      animationFrame = requestAnimationFrame(update);

      onCleanup(() => {
        cleanup();
        cancelAnimationFrame(animationFrame);
      });
    } catch (error) {
      console.error('Error setting up audio waveform analyzer:', error);
    }
  });

  return { bars };
}
