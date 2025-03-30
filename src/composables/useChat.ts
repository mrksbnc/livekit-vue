import { useEnsureRoomContext } from '@/context/room.context';
import { setupChat, type ChatOptions, type ReceivedChatMessage } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { computed, ref, shallowRef, watchEffect, type Ref } from 'vue';
import { useConnectionStatus } from './useConnectionStatus';

export type UseChat = {
  chatMessages: Ref<ReceivedChatMessage[]>;
  isSending: Ref<boolean>;
  send: (message: string) => Promise<unknown>;
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

  const chatSetup = computed<ReturnType<typeof setupChat>>(() =>
    setupChat(room.value, props.options),
  );

  watchEffect((onCleanup) => {
    const messagesSub = chatSetup.value.messageObservable.subscribe({
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

    const sendingSub = chatSetup.value.isSendingObservable.subscribe({
      next: (isSending: boolean) => {
        isSendingRef.value = isSending;
      },
      error: (error: Error) => {
        console.error('Error subscribing to chat sending state:', error);
      },
      complete: () => {
        console.log('Chat sending state subscription completed');
      },
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
    isSending: isSendingRef,
    chatMessages: chatMessagesRef,
    send: chatSetup.value.send,
  };
}
