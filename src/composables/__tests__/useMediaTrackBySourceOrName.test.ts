import {
  TrackOrientation,
  useMediaTrackBySourceOrName,
} from '@/composables/useMediaTrackBySourceOrName';
import type { TrackIdentifier } from '@livekit/components-core';
import * as componentsCore from '@livekit/components-core';
import {
  LocalParticipant,
  Participant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, shallowRef } from 'vue';

vi.mock('@livekit/components-core', async () => {
  const actual = await vi.importActual('@livekit/components-core');
  return {
    ...actual,
    getTrackByIdentifier: vi.fn(),
    setupMediaTrack: vi.fn(),
    isTrackReference: vi.fn((identifier) => identifier && identifier.publication !== undefined),
  };
});

describe('useMediaTrackBySourceOrName', () => {
  const mockTrack = {
    kind: Track.Kind.Video,
    attach: vi.fn(),
    detach: vi.fn(),
  } as unknown as Track;

  const mockPublication = {
    isMuted: false,
    isSubscribed: true,
    track: mockTrack,
    source: Track.Source.Camera,
    kind: Track.Kind.Video,
    dimensions: { width: 640, height: 480 },
    trackSid: 'track-sid-initial',
  } as unknown as TrackPublication;

  const mockParticipant = {
    sid: 'participant-1',
    identity: 'user1',
    isLocal: false,
  } as unknown as RemoteParticipant;

  const mockLocalParticipant = {
    sid: 'local-participant-1',
    identity: 'local-user',
    isLocal: true,
  } as unknown as LocalParticipant;

  const mockTrackIdentifier: TrackIdentifier = {
    participant: mockParticipant as Participant,
    source: Track.Source.Camera,
  };

  const mockTrackObserver = {
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };

  const mockMediaTrackSetup = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackObserver: mockTrackObserver as any,
  };

  const mockElement = document.createElement('video');

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(mockTrack, 'kind', {
      value: Track.Kind.Video,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'isMuted', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'isSubscribed', {
      value: true,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'track', {
      value: mockTrack,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'source', {
      value: Track.Source.Camera,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'kind', {
      value: Track.Kind.Video,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockPublication, 'dimensions', {
      value: { width: 640, height: 480 },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockParticipant, 'isLocal', {
      value: false,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(mockLocalParticipant, 'isLocal', {
      value: true,
      writable: true,
      configurable: true,
    });

    mockTrack.attach = vi.fn();
    mockTrack.detach = vi.fn();

    vi.mocked(componentsCore.getTrackByIdentifier).mockReturnValue(mockPublication);
    vi.mocked(componentsCore.isTrackReference).mockReturnValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(componentsCore.setupMediaTrack).mockReturnValue(mockMediaTrackSetup as any);
  });

  it('should initialize with track publication', () => {
    const { publication, isMuted, isSubscribed, track } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    expect(componentsCore.getTrackByIdentifier).toHaveBeenCalledWith(mockTrackIdentifier);
    expect(publication.value).toBe(mockPublication);
    expect(isMuted.value).toBe(false);
    expect(isSubscribed.value).toBe(true);
    expect(track.value).toBe(mockTrack);
  });

  it('should initialize with null values when track is not found', () => {
    vi.mocked(componentsCore.getTrackByIdentifier).mockReturnValue(undefined);

    const { publication, isMuted, isSubscribed, track } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    expect(publication.value).toBeUndefined();
    expect(isMuted.value).toBe(false);
    expect(isSubscribed.value).toBe(false);
    expect(track.value).toBeUndefined();
  });

  it('should set attributes correctly', () => {
    const { attributes } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    expect(attributes.value).toEqual({
      'data-lk-local-participant': false,
      'data-lk-source': Track.Source.Camera,
      'data-lk-orientation': TrackOrientation.Landscape,
    });
  });

  it('should detect orientation based on track dimensions', async () => {
    const { attributes } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    expect(attributes.value['data-lk-orientation']).toBe(TrackOrientation.Landscape);

    const portraitPublication = {
      ...mockPublication,
      dimensions: { width: 480, height: 640 },
    } as unknown as TrackPublication;
    vi.mocked(componentsCore.getTrackByIdentifier).mockReturnValue(portraitPublication);

    const { attributes: portraitAttributes } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    await nextTick();
    await nextTick();
    expect(portraitAttributes.value['data-lk-orientation']).toBe(TrackOrientation.Portrait);
  });

  it('should update track when observer emits new publication', async () => {
    const { publication, isMuted, isSubscribed, track } = useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: {},
    });

    expect(publication.value).toBe(mockPublication);
    expect(track.value).toBe(mockTrack);

    const newMockTrack = {
      kind: Track.Kind.Audio,
      attach: vi.fn(),
      detach: vi.fn(),
    } as unknown as Track;
    const newMockPublication = {
      isMuted: true,
      isSubscribed: false,
      track: newMockTrack,
      source: Track.Source.Microphone,
      kind: Track.Kind.Audio,
      trackSid: 'new-track-sid',
    } as unknown as TrackPublication;

    const subscribeFn = mockTrackObserver.subscribe.mock.calls[0][0];
    subscribeFn(newMockPublication);
    await nextTick();

    expect(publication.value).toBe(newMockPublication);
    expect(isMuted.value).toBe(true);
    expect(isSubscribed.value).toBe(false);
    expect(track.value).toBe(newMockTrack);
  });

  it('should attach track to provided element', async () => {
    useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: { element: mockElement },
    });

    await nextTick();
    expect(mockTrack.attach).toHaveBeenCalledWith(mockElement);
  });

  it('should not attach track to element if element is null', async () => {
    useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: { element: null },
    });

    await nextTick();
    expect(mockTrack.attach).not.toHaveBeenCalled();
  });

  it('should not attach local audio tracks', async () => {
    const localAudioTrack = {
      kind: Track.Kind.Audio,
      attach: vi.fn(),
      detach: vi.fn(),
    } as unknown as Track;

    const localAudioPublication = {
      ...mockPublication,
      track: localAudioTrack,
      kind: Track.Kind.Audio,
      source: Track.Source.Microphone,
      trackSid: 'local-audio-sid',
    } as unknown as TrackPublication;

    vi.mocked(componentsCore.getTrackByIdentifier).mockReturnValue(localAudioPublication);

    const localIdentifier: TrackIdentifier = {
      participant: mockLocalParticipant as Participant,
      source: Track.Source.Microphone,
    };

    useMediaTrackBySourceOrName({
      observerOptions: localIdentifier,
      options: { element: mockElement },
    });

    await nextTick();
    expect(localAudioTrack.attach).not.toHaveBeenCalled();
  });

  it('should detach old track and attach new track when observer causes track change', async () => {
    const elementRef = shallowRef<HTMLMediaElement | null>(mockElement);
    const identifier: TrackIdentifier = {
      participant: mockParticipant as Participant,
      source: Track.Source.Camera,
    };

    useMediaTrackBySourceOrName({
      observerOptions: identifier,
      options: { element: elementRef.value },
    });
    await nextTick();
    expect(mockTrack.attach).toHaveBeenCalledWith(mockElement);
    expect(mockTrack.detach).not.toHaveBeenCalled();

    (mockTrack.attach as ReturnType<typeof vi.fn>).mockClear();

    const subscribeFn = mockTrackObserver.subscribe.mock.calls[0][0];
    subscribeFn(undefined);
    await nextTick();

    expect(mockTrack.detach).toHaveBeenCalledWith(mockElement);
    expect(mockTrack.attach).not.toHaveBeenCalled();

    (mockTrack.detach as ReturnType<typeof vi.fn>).mockClear();

    const newMockTrack = {
      kind: Track.Kind.Video,
      attach: vi.fn(),
      detach: vi.fn(),
    } as unknown as Track;
    const newMockPublication = {
      ...mockPublication,
      track: newMockTrack,
      trackSid: 'sid-new',
    } as TrackPublication;
    subscribeFn(newMockPublication);
    await nextTick();

    expect(newMockTrack.attach).toHaveBeenCalledWith(mockElement);

    expect(mockTrack.detach).not.toHaveBeenCalled();
  });

  it('should handle errors when detaching track', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Detach error');
    vi.mocked(mockTrack.detach).mockImplementation(() => {
      throw error;
    });

    useMediaTrackBySourceOrName({
      observerOptions: mockTrackIdentifier,
      options: { element: mockElement },
    });
    await nextTick();

    const subscribeFn = mockTrackObserver.subscribe.mock.calls[0][0];
    subscribeFn(undefined);
    await nextTick();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error detaching track during cleanup:', error);

    consoleErrorSpy.mockRestore();
  });
});
