import { useEnsureRoomContext } from '@/context/room.context';
import { setupDataMessageHandler, type ReceivedDataMessage } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { DataPublishOptions, RemoteParticipant } from 'livekit-client';
import { computed, ref, toRefs, type ShallowRef } from 'vue';

export type MessagePayload<T> = {
  payload: Uint8Array;
  topic: T;
  from: RemoteParticipant | undefined;
};

export type UseDataChannelReturnType<T extends string | undefined = undefined> = {
  isSending: ShallowRef<boolean>;
  send: ShallowRef<(payload: Uint8Array, options?: DataPublishOptions) => Promise<void>>;
  message: ShallowRef<MessagePayload<T> | undefined>;
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
): UseDataChannelReturnType<T> {
  const onMessage = typeof topicOrCallback === 'function' ? topicOrCallback : callback;
  const topic = typeof topicOrCallback === 'string' ? topicOrCallback : undefined;
  const room = useEnsureRoomContext();

  const isSending = ref<boolean>(false);
  const message = ref<MessagePayload<T> | undefined>(undefined);

  const messageHandler = computed(() => {
    return setupDataMessageHandler(room?.value, topic, onMessage);
  });

  const { send, messageObservable, isSendingObservable } = toRefs(messageHandler.value);

  useSubscription(
    messageObservable.value.subscribe((msg) => {
      message.value = msg;
    }),
  );

  useSubscription(
    isSendingObservable.value.subscribe((sending) => {
      isSending.value = sending;
    }),
  );

  return {
    message: message as ShallowRef<MessagePayload<T> | undefined>,
    send,
    isSending,
  };
}
