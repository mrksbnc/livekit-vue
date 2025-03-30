import { ref, watchEffect, type Ref } from 'vue';

export type UserInfo = {
  identity?: string;
  name?: string;
  metadata?: string;
};

export type UseTokenProps = {
  identity?: string;
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
  getToken: (refreshToken?: boolean) => Promise<string | undefined>;
};

export function useToken(props: UseTokenArgs): UseToken {
  const token = ref<string | undefined>(undefined);

  const fetchToken = async (): Promise<string | undefined> => {
    if (!props.tokenEndpoint || !props.options?.userInfo?.identity) {
      return;
    }

    try {
      const params = new URLSearchParams({
        ...props.options?.userInfo,
        roomName: props.roomName,
      });

      const res = await fetch(`${props.tokenEndpoint}?${params.toString()}`);

      if (!res.ok) {
        console.error(`Token fetch failed: ${res.status} ${res.statusText}`);
        return undefined;
      }

      const data = await res.json();
      return data.accessToken;
    } catch (err) {
      console.error('Token fetch error:', err);
      return undefined;
    }
  };

  const getToken = async (refreshToken?: boolean): Promise<string | undefined> => {
    if (refreshToken || token.value === undefined) {
      token.value = await fetchToken();
    }
    return token.value;
  };

  watchEffect(async () => {
    if (!token.value) {
      await getToken(true);
    }
  });

  return { token, getToken };
}
