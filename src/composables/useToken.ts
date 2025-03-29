import { ref, watchEffect, type Ref } from 'vue';

export type UserInfo = {
  identity?: string;
  name?: string;
  metadata?: string;
};

export type UseTokenOptions = {
  userInfo?: UserInfo;
};

export type UseTokenArgs = {
  tokenEndpoint: string | undefined;
  roomName: string;
  options?: UseTokenOptions;
};

export type UseToken = {
  token: Ref<string | undefined>;
};

export function useToken({ tokenEndpoint, roomName, options = {} }: UseTokenArgs): UseToken {
  const token = ref<string | undefined>(undefined);

  watchEffect(async () => {
    if (!tokenEndpoint || !options.userInfo?.identity) {
      return;
    }

    try {
      const params = new URLSearchParams({
        ...options.userInfo,
        roomName,
      });

      const res = await fetch(`${tokenEndpoint}?${params.toString()}`);

      if (!res.ok) {
        console.error(`Token fetch failed: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      token.value = data.accessToken;
    } catch (err) {
      console.error('Token fetch error:', err);
    }
  });

  return { token };
}
