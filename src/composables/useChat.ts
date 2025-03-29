import { useEnsureRoomContext } from '@/context/room.context';
import { setupChat, type ChatOptions, type ReceivedChatMessage } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { computed, ref, shallowRef, watchEffect, type Ref } from 'vue';
import { useConnectionStatus } from './useConnectionStatus';

export type UseChat = {
  chatMessages: Ref<ReceivedChatMessage[]>;
  send: (message: string) => Promise<unknown>;
  update: (messageId: string, message: string) => Promise<unknown>;
  isSending: Ref<boolean>;
};

export type UseChatProps = {
  options?: ChatOptions;
};

export function useChat(props: UseChatProps = {}): UseChat {
  const room = useEnsureRoomContext();
  const { connectionState } = useConnectionStatus({ room: room.value });

  const isSendingRef = ref<boolean>(false);
  const chatMessagesRef = shallowRef<ReceivedChatMessage[]>([]);

  const isDisconnected = computed<boolean>(
    () => connectionState.value === ConnectionState.Disconnected,
  );

  const chatHandler = computed<ReturnType<typeof setupChat>>(() =>
    setupChat(room.value, props.options),
  );

  const send = (message: string): Promise<unknown> => {
    return chatHandler.value.send(message);
  };

  const update = (messageId: string, message: string): Promise<unknown> => {
    return chatHandler.value.update(messageId, message);
  };

  watchEffect((onCleanup) => {
    const handler = chatHandler.value;

    const messagesSub = handler.messageObservable.subscribe({
      next: (messages: ReceivedChatMessage[]) => {
        chatMessagesRef.value = messages;
      },
      error: (error: Error) => {
        console.error('Error subscribing to chat messages:', error);
      },
      complete: () => {
        console.log('Chat messages subscription completed');
      },
    });

    const sendingSub = handler.isSendingObservable.subscribe((sending: boolean) => {
      isSendingRef.value = sending;
    });

    if (isDisconnected.value) {
      chatMessagesRef.value = [];
    }

    onCleanup(() => {
      messagesSub.unsubscribe();
      sendingSub.unsubscribe();
    });
  });

  return {
    send,
    update,
    isSending: isSendingRef,
    chatMessages: chatMessagesRef,
  };
}
