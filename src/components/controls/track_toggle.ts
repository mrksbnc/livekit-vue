import type { CaptureOptionsBySource, ToggleSource } from '@livekit/components-core';
import type { TrackPublishOptions } from 'livekit-client';

export interface TrackToggleProps<T extends ToggleSource> {
  source: T;
  showIcon?: boolean;
  initialState?: boolean;
  captureOptions?: CaptureOptionsBySource<T>;
  publishOptions?: TrackPublishOptions;
  onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
  onDeviceError?: (error: Error | unknown) => void;
  customOnClickHandler?: (evt: MouseEvent) => void;
}
