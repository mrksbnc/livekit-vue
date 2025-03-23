import { useEnsureRoomContext } from '@/context/room.context';
import { setupDataMessageHandler, type ReceivedDataMessage } from '@livekit/components-core';
import type { DataPublishOptions, RemoteParticipant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, toRefs, type ShallowRef } from 'vue';
import { useObservableState } from './private/useObservableState';

export type UseDataChannelReturnType<T extends string | undefined = undefined> = {
  isSending: ShallowRef<boolean>;
  send: ShallowRef<(payload: Uint8Array, options?: DataPublishOptions) => Promise<void>>;
  message: ShallowRef<ReceivedDataMessage<T> | undefined>;
};

export function useDataChannel<T extends string>(
  topic: T,
  onMessage?: (msg: ReceivedDataMessage<T>) => void,
): UseDataChannelReturnType<T>;
export function useDataChannel(
  onMessage?: (msg: ReceivedDataMessage) => void,
): UseDataChannelReturnType;
export function useDataChannel<T extends string>(
  topicOrCallback?: T | ((msg: ReceivedDataMessage) => void),
  callback?: (msg: ReceivedDataMessage<T>) => void,
) {
  const onMessage = typeof topicOrCallback === 'function' ? topicOrCallback : callback;
  const topic = typeof topicOrCallback === 'string' ? topicOrCallback : undefined;
  const room = useEnsureRoomContext();

  const messageHandler = computed(() => {
    return setupDataMessageHandler(room?.value, topic, onMessage);
  });

  const { send, messageObservable, isSendingObservable } = toRefs(messageHandler.value);

  const message = useObservableState({
    observable: messageObservable as unknown as Observable<{
      payload: Uint8Array;
      topic: T;
      from: RemoteParticipant | undefined;
    }>,
    startWith: undefined,
  });

  const isSending = useObservableState({
    observable: isSendingObservable as unknown as Observable<boolean>,
    startWith: false,
  });

  return {
    message,
    send,
    isSending,
  };
}
