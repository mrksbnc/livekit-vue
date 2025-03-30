import { useEnsureRoomContext } from '@/context/room.context';
import type { TextStreamHandler, TextStreamWriter } from 'livekit-client';
import { computed, onUnmounted, ref, shallowRef, watchEffect, type ComputedRef } from 'vue';

export type TextStreamInfo = {
  id: string;
  topic: string;
  timestamp: number;
  size?: number;
};

export type UseTextStreamProps = {
  topic: string;
  onMessage?: TextStreamHandler;
  autoCloseStreams?: boolean;
};

export type UseTextStream = {
  isSending: ComputedRef<boolean>;
  activeWriter: ComputedRef<TextStreamWriter | null>;
  topic: ComputedRef<string>;
  sendText: (text: string) => Promise<TextStreamInfo>;
  streamText: () => Promise<TextStreamWriter>;
  registerHandler: (handler: TextStreamHandler) => void;
  unregisterHandler: () => void;
  closeActiveStream: () => Promise<void>;
};

export function useTextStream(props: UseTextStreamProps): UseTextStream {
  const room = useEnsureRoomContext();

  const sending = ref<boolean>(false);
  const activeStreamWriter = shallowRef<TextStreamWriter | null>(null);

  const autoCloseStreams = ref<boolean>(props.autoCloseStreams ?? true);

  const topic = computed<string>(() => props.topic);
  const isSending = computed<boolean>(() => sending.value);
  const activeWriter = computed<TextStreamWriter | null>(() => activeStreamWriter.value);

  const closeActiveStream = async (): Promise<void> => {
    if (activeStreamWriter.value) {
      try {
        await activeStreamWriter.value.close();
        activeStreamWriter.value = null;
      } catch (e) {
        console.error('Error closing text stream writer', e);
      }
    }
  };

  const sendText = async (text: string): Promise<TextStreamInfo> => {
    if (!text.trim()) {
      throw new Error('Cannot send empty text');
    }

    sending.value = true;
    try {
      const info = await room.value.localParticipant.sendText(text, {
        topic: props.topic,
      });
      return info;
    } finally {
      sending.value = false;
    }
  };

  const streamText = async (): Promise<TextStreamWriter> => {
    sending.value = true;

    if (autoCloseStreams.value && activeStreamWriter.value) {
      await closeActiveStream();
    }

    const writer = await room.value.localParticipant.streamText({
      topic: props.topic,
    });

    activeStreamWriter.value = writer;

    const originalClose = writer.close;
    writer.close = async () => {
      const result = await originalClose.call(writer);
      sending.value = false;
      activeStreamWriter.value = null;
      return result;
    };

    return writer;
  };

  const registerHandler = (handler: TextStreamHandler): void => {
    room.value.registerTextStreamHandler(props.topic, handler);
  };

  const unregisterHandler = (): void => {
    room.value.unregisterTextStreamHandler(props.topic);
  };

  watchEffect(() => {
    const currentRoom = room.value;
    const messageHandler = props.onMessage;

    if (currentRoom && messageHandler) {
      currentRoom.registerTextStreamHandler(props.topic, messageHandler);
    }
  });

  onUnmounted(() => {
    closeActiveStream();

    if (room.value && props.onMessage) {
      room.value.unregisterTextStreamHandler(props.topic);
    }
  });

  return {
    topic,
    isSending,
    activeWriter,
    sendText,
    streamText,
    registerHandler,
    unregisterHandler,
    closeActiveStream,
  };
}
