// Main components
export { default as PreJoin } from '../views/PreJoin.vue';
export { default as ConnectionStateIndicator } from './ConnectionStateIndicator.vue';
export { default as LiveKitRoom } from './LiveKitRoom.vue';
export { default as ParticipantGrid } from './ParticipantGrid.vue';
export { default as VideoConference } from './VideoConference.vue';
export { default as VideoControls } from './VideoControls.vue';

// Layout components
export * from './layouts';

// Participant components
export { default as AudioTrack } from './participant/AudioTrack.vue';
export { default as AudioVisualizer } from './participant/AudioVisualizer.vue';
export { default as ConnectionQualityIndicator } from './participant/ConnectionQualityIndicator.vue';
export { default as ParticipantAudioTile } from './participant/ParticipantAudioTile.vue';
export { default as ParticipantName } from './participant/ParticipantName.vue';
export { default as ParticipantTile } from './participant/ParticipantTile.vue';
export { default as TrackMutedIndicator } from './participant/TrackMutedIndicator.vue';
export { default as VideoTrack } from './participant/VideoTrack.vue';

// Control components
export { default as DisconnectButton } from './controls/DisconnectButton.vue';
export { default as TrackToggle } from './controls/TrackToggle.vue';

// Icon components
export { default as ParticipantPlaceholderIcon } from './icons/ParticipantPlaceholderIcon.vue';
export { default as TrackIcon } from './icons/TrackIcon.vue';
