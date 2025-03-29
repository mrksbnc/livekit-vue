import * as facingModeModule from '@/composables/useFacingMode';
import * as isMutedModule from '@/composables/useIsMuted';
import * as isSpeakingModule from '@/composables/useIsSpeaking';
import { useParticipantTile } from '@/composables/useParticipantTile';
import * as trackRefContext from '@/context/track_reference.context';
import { Track } from 'livekit-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

// Mock dependencies
vi.mock('@/context/track_reference.context', () => ({
  useEnsureTrackRef: vi.fn(),
}));

vi.mock('@/composables/useFacingMode', () => ({
  useFacingMode: vi.fn(),
  FacingMode: {
    Environment: 'environment',
    User: 'user',
    Unknown: 'unknown',
  },
}));

vi.mock('@/composables/useIsMuted', () => ({
  useIsMuted: vi.fn(),
}));

vi.mock('@/composables/useIsSpeaking', () => ({
  useIsSpeaking: vi.fn(),
}));

describe('useParticipantTile', () => {
  // Mock track reference
  const mockPublication = {
    trackName: 'camera',
    track: { sid: 'track-1' },
  };

  const mockParticipant = {
    identity: 'test-participant',
    isLocal: false,
    getTrackPublication: vi.fn().mockReturnValue(mockPublication),
  };

  const mockTrackRef = {
    participant: mockParticipant,
    source: Track.Source.Camera,
    publication: mockPublication,
  };

  // Set up mocks for imported composables
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock track reference context
    vi.spyOn(trackRefContext, 'useEnsureTrackRef').mockReturnValue(ref(mockTrackRef));

    // Mock useFacingMode
    vi.spyOn(facingModeModule, 'useFacingMode').mockReturnValue({
      facingMode: computed(() => facingModeModule.FacingMode.User),
    });

    // Mock useIsMuted with different return values for video and audio
    vi.spyOn(isMutedModule, 'useIsMuted')
      .mockImplementationOnce(() => ({ isMuted: ref(false) })) // Video
      .mockImplementationOnce(() => ({ isMuted: ref(true) })); // Audio

    // Mock useIsSpeaking
    vi.spyOn(isSpeakingModule, 'useIsSpeaking').mockReturnValue({
      isSpeaking: ref(true),
    });
  });

  it('should generate correct attributes', () => {
    const { attributes } = useParticipantTile({
      trackRef: mockTrackRef,
    });

    expect(attributes.value).toEqual({
      'data-lk-audio-muted': true,
      'data-lk-video-muted': false,
      'data-lk-speaking': true,
      'data-lk-local-participant': false,
      'data-lk-source': Track.Source.Camera,
      'data-lk-facing-mode': facingModeModule.FacingMode.User,
    });
  });

  it('should respect disableSpeakingIndicator prop', () => {
    const { attributes } = useParticipantTile({
      trackRef: mockTrackRef,
      disableSpeakingIndicator: true,
    });

    expect(attributes.value['data-lk-speaking']).toBe(false);
  });

  it('should create a microphone reference for the participant', () => {
    useParticipantTile({
      trackRef: mockTrackRef,
    });

    // Check that useIsMuted was called with correct arguments
    const isMutedCalls = vi.mocked(isMutedModule.useIsMuted).mock.calls;

    // Second call should be for audio with source as Microphone
    const audioCall = isMutedCalls[1][0];
    expect(audioCall.sourceOrTrackRef.source).toBe(Track.Source.Microphone);
    expect(audioCall.sourceOrTrackRef.participant).toBe(mockParticipant);
  });

  it('should call onParticipantClick when onClick is triggered', () => {
    const onParticipantClick = vi.fn();

    const { onClick } = useParticipantTile({
      trackRef: mockTrackRef,
      onParticipantClick,
    });

    onClick();

    expect(onParticipantClick).toHaveBeenCalledWith({
      participant: mockParticipant,
      track: mockPublication,
    });
  });

  it('should not call onParticipantClick when not provided', () => {
    const onParticipantClick = vi.fn();

    const { onClick } = useParticipantTile({
      trackRef: mockTrackRef,
      // No onParticipantClick provided
    });

    onClick();

    expect(onParticipantClick).not.toHaveBeenCalled();
  });

  it('should handle local participants correctly', () => {
    // Set participant to local
    const localParticipant = {
      ...mockParticipant,
      isLocal: true,
    };

    const localTrackRef = {
      ...mockTrackRef,
      participant: localParticipant,
    };

    vi.spyOn(trackRefContext, 'useEnsureTrackRef').mockReturnValue(ref(localTrackRef));

    const { attributes } = useParticipantTile({
      trackRef: localTrackRef,
    });

    expect(attributes.value['data-lk-local-participant']).toBe(true);
  });

  it('should handle participant without track publication', () => {
    const participantWithoutTrack = {
      ...mockParticipant,
      getTrackPublication: vi.fn().mockReturnValue(null),
    };

    const trackRefWithoutPub = {
      ...mockTrackRef,
      participant: participantWithoutTrack,
      publication: null,
    };

    vi.spyOn(trackRefContext, 'useEnsureTrackRef').mockReturnValue(ref(trackRefWithoutPub));

    const onParticipantClick = vi.fn();
    const { onClick } = useParticipantTile({
      trackRef: trackRefWithoutPub,
      onParticipantClick,
    });

    onClick();

    expect(onParticipantClick).toHaveBeenCalledWith({
      participant: participantWithoutTrack,
      track: null,
    });
  });
});
