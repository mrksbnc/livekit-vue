import {
  addMediaTimestampToTranscription as addTimestampsToTranscription,
  dedupeSegments,
  trackTranscriptionObserver,
  type ReceivedTranscriptionSegment,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import type { TranscriptionSegment } from 'livekit-client';
import { ref, watchEffect, type Ref } from 'vue';
import { useTrackSyncTime } from './useTrackSyncTime';

export type TrackTranscriptionOptions = {
  /**
   * How many transcription segments should be buffered in state
   * @defaultValue 100
   */
  bufferSize?: number;
  onTranscription?: (newSegments: TranscriptionSegment[]) => void;
};

export type UseTrackTranscription = {
  segments: Ref<ReceivedTranscriptionSegment[]>;
};

export type UseTrackTranscriptionProps = {
  trackRef: TrackReferenceOrPlaceholder | undefined;
  options?: TrackTranscriptionOptions;
};

const TRACK_TRANSCRIPTION_DEFAULTS = {
  bufferSize: 100,
} as const satisfies TrackTranscriptionOptions;

export function useTrackTranscription(props: UseTrackTranscriptionProps): UseTrackTranscription {
  const opts = { ...TRACK_TRANSCRIPTION_DEFAULTS, ...props.options };

  const segments = ref<ReceivedTranscriptionSegment[]>([]);

  const { data: syncTimestamps } = useTrackSyncTime({
    trackRef: props.trackRef,
  });

  const handleSegmentMessage = (newSegments: TranscriptionSegment[]): void => {
    try {
      opts.onTranscription?.(newSegments);

      segments.value = dedupeSegments(
        segments.value,
        newSegments.map((s) => addTimestampsToTranscription(s, syncTimestamps.value)),
        opts.bufferSize,
      );
    } catch (error) {
      console.error('Error handling transcription segments:', error);
    }
  };

  watchEffect((onCleanup) => {
    if (!props.trackRef?.publication) {
      return;
    }

    const subscription = trackTranscriptionObserver(props.trackRef.publication).subscribe({
      next: (evt) => {
        handleSegmentMessage(...evt);
      },
      error: (err) => {
        console.error('Error in track transcription subscription:', err);
      },
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  return { segments };
}
