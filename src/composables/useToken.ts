import { ref, watch, type Ref } from 'vue';

export type UserInfo = {
  identity?: string;
  name?: string;
  metadata?: string;
};

export type UseTokenOptions = {
  userInfo?: UserInfo;
};

export type UseTokenArgs = {
  tokenEndpoint: string;
  roomName: string;
  options?: UseTokenOptions;
};

export type UseToken = {
  token: Ref<string | undefined>;
};

export function useToken({ tokenEndpoint, roomName, options = {} }: UseTokenArgs): UseToken {
  const token = ref<string | undefined>(undefined);

  async function fetchToken() {
    console.debug('fetching token');

    const params = new URLSearchParams({ ...options.userInfo, roomName });
    const res = await fetch(`${tokenEndpoint}?${params.toString()}`);

    if (!res.ok) {
      console.error(
        `Could not fetch token. Server responded with status ${res.status}: ${res.statusText}`,
      );
      return;
    }

    const { accessToken } = await res.json();
    token.value = accessToken;
  }

  watch([tokenEndpoint, roomName, options.userInfo], fetchToken);

  return { token };
}
