import type { TrackToggleProps } from '@/components/controls/track_toggle';
import { useMaybeRoomContext } from '@/context/room.context';
import { setupManualToggle, setupMediaToggle, type ToggleSource } from '@livekit/components-core';
import type {
  AudioCaptureOptions,
  LocalTrackPublication,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client';
import { computed, ref, watchEffect, type ComputedRef, type Ref } from 'vue';

export type UseTrackToggleProps = Omit<TrackToggleProps, 'showIcon'>;

export type ToggleButtonAttributes = {
  'aria-pressed': boolean;
  'data-lk-source': ToggleSource;
  'data-lk-enabled': boolean;
};

export type ToggleFunction = (
  forceState?: boolean,
  captureOptions?: VideoCaptureOptions | AudioCaptureOptions | ScreenShareCaptureOptions,
) => Promise<boolean | undefined | void>;

export type UseTrackToggle = {
  toggle?: ToggleFunction;
  enabled: Ref<boolean>;
  pending: Ref<boolean>;
  track: ComputedRef<LocalTrackPublication | undefined>;
  attributes: ComputedRef<ToggleButtonAttributes>;
  disabled: ComputedRef<boolean>;
  onClick: (evt: MouseEvent) => void;
};

export function useTrackToggle(props: UseTrackToggleProps): UseTrackToggle {
  const room = useMaybeRoomContext();

  const enabled = ref<boolean>(props.initialState ?? false);
  const pending = ref<boolean>(false);
  const userInteraction = ref<boolean>(false);

  const track = computed<LocalTrackPublication | undefined>(() =>
    room?.value?.localParticipant?.getTrackPublication(props.source),
  );

  const mediaToggle = computed<ReturnType<typeof setupMediaToggle | typeof setupManualToggle>>(
    () => {
      if (!room?.value) {
        return setupManualToggle();
      }

      try {
        return setupMediaToggle(
          props.source,
          room.value,
          props.captureOptions,
          props.publishOptions,
          props.onDeviceError,
        );
      } catch (error) {
        console.error('Failed to set up media toggle:', error);
        return setupManualToggle();
      }
    },
  );

  const attributes = computed<ToggleButtonAttributes>(() => ({
    'aria-pressed': enabled.value,
    'data-lk-source': props.source,
    'data-lk-enabled': enabled.value,
  }));

  const disabled = computed<boolean>(() => pending.value);

  function onClick(evt: MouseEvent): void {
    userInteraction.value = true;

    if (mediaToggle.value.toggle) {
      mediaToggle.value.toggle().catch((error) => {
        console.error('Failed to toggle track:', error);
        userInteraction.value = false;
      });
    }

    if (props.customOnClickHandler) {
      props.customOnClickHandler(evt);
    }
  }

  watchEffect((onCleanup) => {
    const toggleObserver = mediaToggle.value.enabledObserver;
    if (!toggleObserver) {
      return;
    }

    const subscription = toggleObserver.subscribe({
      next: (value) => {
        enabled.value = value;

        if (props.onChange) {
          props.onChange(value, userInteraction.value);
          userInteraction.value = false;
        }
      },
      error: (err) => {
        console.error('Error in enabled state observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect((onCleanup) => {
    const pendingObserver = mediaToggle.value.pendingObserver;
    if (!pendingObserver) {
      return;
    }

    const subscription = pendingObserver.subscribe({
      next: (value) => {
        pending.value = value;
      },
      error: (err) => {
        console.error('Error in pending state observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  watchEffect(() => {
    if (props.initialState === undefined || !mediaToggle.value.toggle) {
      return;
    }

    console.debug('Forcing initial toggle state:', props.source, props.initialState);

    try {
      mediaToggle.value.toggle(props.initialState).catch((error) => {
        console.error('Failed to set initial state:', error);
        userInteraction.value = false;
      });
    } catch (error) {
      console.error('Error setting initial state:', error);
    }
  });

  return {
    toggle: mediaToggle.value.toggle,
    enabled,
    pending,
    track,
    attributes,
    onClick,
    disabled,
  };
}
