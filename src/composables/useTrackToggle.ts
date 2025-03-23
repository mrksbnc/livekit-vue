import type { TrackToggleProps } from '@/components/controls/track_toggle';
import { useMaybeRoomContext } from '@/context/room.context';
import { setupManualToggle, setupMediaToggle, type ToggleSource } from '@livekit/components-core';
import type {
  AudioCaptureOptions,
  LocalTrackPublication,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, onMounted, ref, watch, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseTrackToggleProps = Omit<TrackToggleProps, 'showIcon'>;

export type StateObserver = Observable<boolean>;

export type UseTrackToggleReturnType = {
  toggle?:
    | ((forceState?: boolean) => Promise<void>)
    | ((
        forceState?: boolean,
        captureOptions?:
          | VideoCaptureOptions
          | AudioCaptureOptions
          | ScreenShareCaptureOptions
          | undefined,
      ) => Promise<boolean | undefined>);
  enabled: ShallowRef<boolean>;
  pending: ShallowRef<boolean>;
  track: ShallowRef<LocalTrackPublication | undefined>;
  buttonProps: {
    'aria-pressed': boolean;
    'data-lk-source': ToggleSource;
    'data-lk-enabled': boolean;
    disabled: boolean;
    onClick: (evt: MouseEvent) => void;
  };
};

export function useTrackToggle(options: UseTrackToggleProps): UseTrackToggleReturnType {
  const room = useMaybeRoomContext();

  const userInteractionRef = ref<boolean>(false);

  const track = computed<LocalTrackPublication | undefined>(() =>
    room?.value?.localParticipant?.getTrackPublication(options.source),
  );

  const setupMediaToggleResult = computed(() =>
    room
      ? setupMediaToggle<ToggleSource>(
          options.source,
          room.value,
          options.captureOptions,
          options.publishOptions,
          options.onDeviceError,
        )
      : setupManualToggle(),
  );

  const pending = useObservableState({
    observable: setupMediaToggleResult.value.pendingObserver as unknown as StateObserver,
    startWith: false,
  });

  const enabled = useObservableState({
    observable: setupMediaToggleResult.value.enabledObserver as unknown as StateObserver,
    startWith: options.initialState ?? !!track.value?.isEnabled,
  });

  function onOnClick(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    userInteractionRef.value = true;

    setupMediaToggleResult.value.toggle().catch(() => (userInteractionRef.value = false));

    if (options.customOnClickHandler) {
      options.customOnClickHandler(evt);
    }
  }

  watch(enabled, (enabled) => {
    options?.onChange?.(enabled, userInteractionRef.value);
    userInteractionRef.value = false;
  });

  onMounted(() => {
    if (options.initialState !== undefined) {
      console.debug('forcing initial toggle state', options.source, options.initialState);
      setupMediaToggleResult.value.toggle(options.initialState);
    }
  });

  return {
    toggle: setupMediaToggleResult.value.toggle,
    enabled,
    pending,
    track,
    buttonProps: {
      'aria-pressed': enabled.value,
      'data-lk-source': options.source,
      'data-lk-enabled': enabled.value,
      disabled: pending.value ?? false,
      onClick: onOnClick,
    },
  };
}
