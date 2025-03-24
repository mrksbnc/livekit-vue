import { Room } from 'livekit-client';
import { expect, suite, test } from 'vitest';
import { useAudioPlayback } from './useAudioPlayback';

suite('useAudioPlayback.ts', () => {
  suite('useAudioPlayback composable was called without valid room provided', () => {
    test('should throw an error', () => {
      expect(() => useAudioPlayback()).toThrowError();
    });
  });

  suite('useAudioPlayback composable was called with valid room provided', () => {
    test('should return a valid object', () => {
      const { canPlayAudio, startAudio } = useAudioPlayback(new Room());

      expect(canPlayAudio.value).toBe(true);
      expect(typeof startAudio).toBe('function');
    });

    test('canPlayAudio should be true when audio playback is allowed', async () => {
      const room = new Room();
      const { canPlayAudio } = useAudioPlayback(room);

      await room.startAudio();

      expect(canPlayAudio.value).toBe(true);
    });

    test('canPlayAudio should be a reactive value', async () => {
      const room = new Room();
      const { canPlayAudio } = useAudioPlayback(room);

      expect(canPlayAudio).toBeInstanceOf(Object);
      expect(canPlayAudio.value).toBeDefined();
    });

    test('function startAudio should be returned from useAudioPlayback', async () => {
      const room = new Room();
      const { startAudio } = useAudioPlayback(room);

      expect(startAudio).toBeDefined();
      expect(typeof startAudio).toBe('function');
    });

    test('function startAudio should start audio playback and it should be an async function', async () => {
      const room = new Room();
      const { startAudio } = useAudioPlayback(room);

      await startAudio();

      expect(room.canPlaybackAudio).toBe(true);
      expect(startAudio()).toBeInstanceOf(Promise);
    });
  });
});
