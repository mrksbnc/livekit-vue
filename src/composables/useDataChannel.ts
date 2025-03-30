import { useEnsureRoomContext } from '@/context/room.context';
import { setupDataMessageHandler, type ReceivedDataMessage } from '@livekit/components-core';
import type { DataPublishOptions } from 'livekit-client';
import { computed, ref, shallowRef, watchEffect, type Ref, type ShallowRef } from 'vue';

export type UseDataChannelProps<T extends string | undefined = undefined> = {
  topic?: T;
  onMessage?: (msg: ReceivedDataMessage<T>) => void;
};

export type UseDataChannel<T extends string | undefined = undefined> = {
  isSending: Ref<boolean>;
  send: (payload: Uint8Array, options?: DataPublishOptions) => Promise<void>;
  message: ShallowRef<ReceivedDataMessage<T> | undefined>;
};

export function useDataChannel<T extends string>(props: UseDataChannelProps<T>): UseDataChannel<T>;
export function useDataChannel(onMessage?: (msg: ReceivedDataMessage) => void): UseDataChannel;
export function useDataChannel<T extends string>(
  topicOrCallbackOrProps?: T | ((msg: ReceivedDataMessage) => void) | UseDataChannelProps<T>,
  callback?: (msg: ReceivedDataMessage<T>) => void,
): UseDataChannel<T> {
  let onMessage: ((msg: ReceivedDataMessage<T>) => void) | undefined;
  let topic: T | undefined;

  if (typeof topicOrCallbackOrProps === 'function') {
    onMessage = topicOrCallbackOrProps as (msg: ReceivedDataMessage<T>) => void;
  } else if (typeof topicOrCallbackOrProps === 'object' && topicOrCallbackOrProps !== null) {
    const props = topicOrCallbackOrProps as UseDataChannelProps<T>;
    topic = props.topic;
    onMessage = props.onMessage;
  } else {
    topic = topicOrCallbackOrProps as T | undefined;
    onMessage = callback;
  }

  const room = useEnsureRoomContext();
  const isSending = ref<boolean>(false);
  const message = shallowRef<ReceivedDataMessage<T> | undefined>(undefined);

  const dataHandler = computed<ReturnType<typeof setupDataMessageHandler>>(() =>
    setupDataMessageHandler(room.value, topic, onMessage),
  );

  const send = (payload: Uint8Array, options?: DataPublishOptions): Promise<void> => {
    return dataHandler.value.send(payload, options);
  };

  watchEffect((onCleanup) => {
    const handler = dataHandler.value;

    const msgSub = handler.messageObservable.subscribe((receivedMsg) => {
      message.value = receivedMsg as unknown as ReceivedDataMessage<T>;
    });

    const sendSub = handler.isSendingObservable.subscribe((status) => {
      isSending.value = status;
    });

    onCleanup(() => {
      msgSub.unsubscribe();
      sendSub.unsubscribe();
    });
  });

  return { message, send, isSending };
}
