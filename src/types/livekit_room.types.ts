import type {
  AudioCaptureOptions,
  DisconnectReason,
  MediaDeviceFailure,
  Room,
  RoomConnectOptions,
  RoomOptions,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client';
import type { HTMLAttributes } from 'vue';

export type LiveKitRoomProps = {
  /**
   * URL to the LiveKit server.
   * For example: `wss://<domain>.livekit.cloud`
   * To simplify the implementation, `undefined` is also accepted as an intermediate value, but only with a valid string url can the connection be established.
   */
  serverUrl: string | undefined;
  /**
   * A user specific access token for a client to authenticate to the room.
   * This token is necessary to establish a connection to the room.
   * To simplify the implementation, `undefined` is also accepted as an intermediate value, but only with a valid string token can the connection be established.
   *
   * @see https://docs.livekit.io/cloud/project-management/keys-and-tokens/#generating-access-tokens
   */
  token: string | undefined;
  /**
   * Publish audio immediately after connecting to your LiveKit room.
   * @defaultValue `false`
   * @see https://docs.livekit.io/client-sdk-js/interfaces/AudioCaptureOptions.html
   */
  audio?: AudioCaptureOptions | boolean;
  /**
   * Publish video immediately after connecting to your LiveKit room.
   * @defaultValue `false`
   * @see https://docs.livekit.io/client-sdk-js/interfaces/VideoCaptureOptions.html
   */
  video?: VideoCaptureOptions | boolean;
  /**
   * Publish screen share immediately after connecting to your LiveKit room.
   * @defaultValue `false`
   * @see https://docs.livekit.io/client-sdk-js/interfaces/ScreenShareCaptureOptions.html
   */
  screen?: ScreenShareCaptureOptions | boolean;
  /**
   * If set to true a connection to LiveKit room is initiated.
   * @defaultValue `true`
   */
  connect?: boolean;
  /**
   * Options for when creating a new room.
   * When you pass your own room instance to this component, these options have no effect.
   * Instead, set the options directly in the room instance.
   *
   * @see https://docs.livekit.io/client-sdk-js/interfaces/RoomOptions.html
   */
  options?: RoomOptions;
  /**
   * Define options how to connect to the LiveKit server.
   *
   * @see https://docs.livekit.io/client-sdk-js/interfaces/RoomConnectOptions.html
   */
  connectOptions?: RoomConnectOptions;
  /**
   * Optional room instance.
   * By passing your own room instance you overwrite the `options` parameter,
   * make sure to set the options directly on the room instance itself.
   */
  room?: Room;
  simulateParticipants?: number | undefined;
  htmlProps?: HTMLAttributes;
  onConnected?: () => void;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onError?: (error: Error) => void;
  onMediaDeviceFailure?: (failure?: MediaDeviceFailure) => void;
  onEncryptionError?: (error: Error) => void;
};
