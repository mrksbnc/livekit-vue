import type { TrackToggleProps } from '@/components/controls/track_toggle';
import { useMaybeRoomContext } from '@/context/room.context';
import { setupManualToggle, setupMediaToggle, type ToggleSource } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type {
  AudioCaptureOptions,
  LocalTrackPublication,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, onMounted, ref, watch, type ShallowRef } from 'vue';

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
  pending: ShallowRef<boolean | undefined>;
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

  const enabled = ref<boolean>(options.initialState ?? false);
  const pending = ref<boolean | undefined>(undefined);

  const userInteractionRef = ref<boolean>(false);

  const track = computed<LocalTrackPublication | undefined>(() =>
    room?.value?.localParticipant?.getTrackPublication(options.source),
  );

  const setupMediaToggleResult = computed(() => {
    if (room?.value) {
      return setupMediaToggle<ToggleSource>(
        options.source,
        room.value,
        options.captureOptions,
        options.publishOptions,
        options.onDeviceError,
      );
    }
    return setupManualToggle();
  });

  const toggle = setupMediaToggleResult.value.toggle;

  const enabledObserver = computed<StateObserver>(() => {
    return setupMediaToggleResult.value.enabledObserver as unknown as StateObserver;
  });

  const pendingObserver = computed<StateObserver>(() => {
    return setupMediaToggleResult.value.pendingObserver as unknown as StateObserver;
  });

  function onOnClick(evt: MouseEvent): void {
    userInteractionRef.value = true;

    if (toggle) {
      toggle().catch(() => (userInteractionRef.value = false));
    }

    if (options.customOnClickHandler) {
      options.customOnClickHandler(evt);
    }
  }

  watch(
    () => enabled.value,
    (enabled) => {
      options?.onChange?.(enabled, userInteractionRef.value);
      userInteractionRef.value = false;
    },
  );

  useSubscription(enabledObserver.value.subscribe((v) => (enabled.value = v)));
  useSubscription(pendingObserver.value.subscribe((v) => (pending.value = v)));

  onMounted(() => {
    if (options.initialState !== undefined) {
      console.debug('forcing initial toggle state', options.source, options.initialState);

      if (toggle) {
        toggle(options.initialState).catch(() => (userInteractionRef.value = false));
      }
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
