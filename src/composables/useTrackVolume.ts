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
import { onBeforeMount, onWatcherCleanup, ref, watch, type ShallowRef } from 'vue';

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

  // Normalize all frequency values
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
  trackOrTrackReference?: LocalAudioTrack | RemoteAudioTrack | TrackReference,
  options: AudioAnalyserOptions = { fftSize: 32, smoothingTimeConstant: 0 },
): ShallowRef<number> {
  const track = isTrackReference(trackOrTrackReference)
    ? <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrTrackReference.publication.track
    : trackOrTrackReference;

  const volume = ref<number>(0);

  watch(
    () => track,
    (val) => {
      if (!val || !val.mediaStream) {
        return;
      }

      const { cleanup, analyser } = createAudioAnalyser(val, options);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateVolume() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const a = dataArray[i];
          sum += a * a;
        }
        volume.value = Math.sqrt(sum / dataArray.length) / 255;
      }

      const interval = setInterval(updateVolume, 1000 / 30);

      onWatcherCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    },
    { deep: true },
  );

  return volume;
}

export function useMultibandTrackVolume(
  trackOrTrackReference?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder,
  options: MultiBandTrackVolumeOptions = {},
): ShallowRef<number[]> {
  const track =
    trackOrTrackReference instanceof Track
      ? trackOrTrackReference
      : <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrTrackReference?.publication?.track;

  const opts = { ...multibandDefaults, ...options };
  const frequencyBands = ref<number[]>(new Array(opts.bands).fill(0));

  watch(
    [track, options],
    () => {
      if (!track || !track?.mediaStream) {
        return;
      }
      const { analyser, cleanup } = createAudioAnalyser(track, opts.analyserOptions);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const updateVolume = () => {
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
      };

      const interval = setInterval(updateVolume, opts.updateInterval);

      onWatcherCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    },
    { deep: true },
  );

  return frequencyBands;
}

export function useAudioWaveform(
  trackOrTrackReference?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder,
  options: AudioWaveformOptions = {},
): {
  bars: ShallowRef<number[]>;
} {
  const track =
    trackOrTrackReference instanceof Track
      ? trackOrTrackReference
      : <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrTrackReference?.publication?.track;
  const opts = { ...waveformDefaults, ...options };

  const aggregateWave = ref<Float32Array<ArrayBuffer>>(new Float32Array());
  const timeRef = ref<number>(performance.now());
  const updates = ref<number>(0);
  const bars = ref<number[]>([]);

  function onUpdate(wave: Float32Array) {
    bars.value = Array.from(
      filterData(wave, opts.barCount).map((v) => Math.sqrt(v) * opts.volMultiplier),
    );
  }

  watch([track, options], () => {
    if (!track || !track?.mediaStream) {
      return;
    }

    const { analyser, cleanup } = createAudioAnalyser(track, {
      fftSize: getFFTSizeValue(opts.barCount),
    });

    const bufferLength = getFFTSizeValue(opts.barCount);
    const dataArray = new Float32Array(bufferLength);

    const update = () => {
      updateWaveform = requestAnimationFrame(update);
      analyser.getFloatTimeDomainData(dataArray);
      aggregateWave.value.map((v, i) => v + dataArray[i]);
      updates.value += 1;

      if (performance.now() - timeRef.value >= opts.updateInterval) {
        const newData = dataArray.map((v) => v / updates.value);
        onUpdate(newData);
        timeRef.value = performance.now();
        updates.value = 0;
      }
    };

    let updateWaveform = requestAnimationFrame(update);

    onWatcherCleanup(() => {
      cleanup();
      cancelAnimationFrame(updateWaveform);
    });
  });

  onBeforeMount(() => {
    onUpdate(aggregateWave.value);
  });

  return {
    bars,
  };
}
