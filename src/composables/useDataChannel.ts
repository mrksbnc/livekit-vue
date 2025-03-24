import { useEnsureRoomContext } from '@/context/room.context';
import { setupDataMessageHandler, type ReceivedDataMessage } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { DataPublishOptions, RemoteParticipant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, ref, shallowRef, toRefs, type Ref, type ShallowRef } from 'vue';

export type MessagePayload<T> = {
  payload: Uint8Array;
  topic: T;
  from: RemoteParticipant | undefined;
};

export type MessageHandler<T = unknown> = {
  messageObservable: Observable<{
    payload: Uint8Array;
    topic: T;
    from: RemoteParticipant | undefined;
  }>;
  isSendingObservable: Observable<boolean>;
  send: (payload: Uint8Array, options?: DataPublishOptions) => Promise<void>;
};

export type UseDataChannel<T extends string | undefined = undefined> = {
  isSending: Ref<boolean>;
  send: Ref<(payload: Uint8Array, options?: DataPublishOptions) => Promise<void>>;
  message: ShallowRef<MessagePayload<T> | undefined>;
};

export function useDataChannel<T extends string>(
  topic: T,
  onMessage?: (msg: ReceivedDataMessage<T>) => void,
): UseDataChannel<T>;
export function useDataChannel(onMessage?: (msg: ReceivedDataMessage) => void): UseDataChannel;
export function useDataChannel<T extends string>(
  topicOrCallback?: T | ((msg: ReceivedDataMessage) => void),
  callback?: (msg: ReceivedDataMessage<T>) => void,
): UseDataChannel<T> {
  const onMessage = typeof topicOrCallback === 'function' ? topicOrCallback : callback;
  const topic = typeof topicOrCallback === 'string' ? topicOrCallback : undefined;
  const room = useEnsureRoomContext();

  const isSending = ref<boolean>(false);
  const message = shallowRef<MessagePayload<T> | undefined>(undefined);

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
    message,
    send,
    isSending,
  };
}
