import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

export type BarVisualizerOptions = {
  /** in percentage */
  maxHeight?: number;
  /** in percentage */
  minHeight?: number;
};

export type AgentState = 'connecting' | 'initializing' | 'listening' | 'thinking';

export type BarVisualizerProps = {
  /** If set, the visualizer will transition between different voice assistant states */
  state?: AgentState;
  /** Number of bars that show up in the visualizer */
  barCount?: number;
  trackRef?: TrackReferenceOrPlaceholder;
  options?: BarVisualizerOptions;
};
