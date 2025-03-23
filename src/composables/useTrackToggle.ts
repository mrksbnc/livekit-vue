import type { TrackToggleProps } from '@/components/controls/track_toggle';
import { useMaybeRoomContext } from '@/context/room.context';
import {
  setupManualToggle,
  setupMediaToggle,
  type CaptureOptionsBySource,
  type ToggleSource,
} from '@livekit/components-core';
import type { LocalTrackPublication } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, onMounted, ref, toRefs, watch, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseTrackToggleProps<T extends ToggleSource> = Omit<TrackToggleProps<T>, 'showIcon'>;

export type StateObserver = Observable<boolean>;

export type UseTrackToggleReturnType<T extends ToggleSource> = {
  toggle?: ShallowRef<
    | ((forceState?: boolean) => Promise<void>)
    | ((
        forceState?: boolean,
        captureOptions?: CaptureOptionsBySource<T> | undefined,
      ) => Promise<boolean | undefined>)
  >;
  enabled: ShallowRef<boolean>;
  pending: ShallowRef<boolean>;
  track: ShallowRef<LocalTrackPublication | undefined>;
  buttonProps: {
    'aria-pressed': boolean;
    'data-lk-source': T;
    'data-lk-enabled': boolean;
    disabled: boolean;
    onClick: (evt: MouseEvent) => void;
  };
};

export function useTrackToggle<T extends ToggleSource>(
  options: UseTrackToggleProps<T>,
): UseTrackToggleReturnType<T> {
  const room = useMaybeRoomContext();

  const userInteractionRef = ref<boolean>(false);

  const track = computed<LocalTrackPublication | undefined>(() =>
    room?.value?.localParticipant?.getTrackPublication(options.source),
  );

  const setupMediaToggleResult = computed(() =>
    room
      ? setupMediaToggle<T>(
          options.source,
          room.value,
          options.captureOptions,
          options.publishOptions,
          options.onDeviceError,
        )
      : setupManualToggle(),
  );

  const { className, enabledObserver, pendingObserver, toggle } = toRefs(
    setupMediaToggleResult.value,
  );

  const pending = useObservableState({
    observable: pendingObserver.value as unknown as StateObserver,
    startWith: false,
  });

  const enabled = useObservableState({
    observable: enabledObserver.value as unknown as StateObserver,
    startWith: options.initialState ?? !!track.value?.isEnabled,
  });

  function onOnClick(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    userInteractionRef.value = true;

    toggle?.value().catch(() => (userInteractionRef.value = false));

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
      toggle?.value(options.initialState);
    }
  });

  return {
    toggle,
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
