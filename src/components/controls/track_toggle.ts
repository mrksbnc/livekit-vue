import type { CaptureOptionsBySource, ToggleSource } from '@livekit/components-core';
import type { TrackPublishOptions } from 'livekit-client';

export type TrackToggleProps = {
  source: ToggleSource;
  showIcon?: boolean;
  initialState?: boolean;
  captureOptions?: CaptureOptionsBySource<ToggleSource>;
  publishOptions?: TrackPublishOptions;
  onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
  onDeviceError?: (error: Error | unknown) => void;
  customOnClickHandler?: (evt: MouseEvent) => void;
};
