import { useToken } from '@/composables/useToken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

describe('useToken', () => {
  // Mock global fetch
  const mockFetchResponse = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn().mockResolvedValue({ accessToken: 'mock-token-123' }),
  };

  global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undefined token', () => {
    const { token } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
          name: 'Test User',
        },
      },
    });

    expect(token.value).toBeUndefined();
  });

  it('should fetch token when getToken is called', async () => {
    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
          name: 'Test User',
        },
      },
    });

    const token = await getToken();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/token?identity=test-user&name=Test+User&roomName=test-room',
    );
    expect(token).toBe('mock-token-123');
  });

  it('should not fetch token when tokenEndpoint is undefined', async () => {
    const { getToken } = useToken({
      tokenEndpoint: undefined,
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    const token = await getToken();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(token).toBeUndefined();
  });

  it('should not fetch token when identity is missing', async () => {
    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          // No identity provided
          name: 'Test User',
        },
      },
    });

    const token = await getToken();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(token).toBeUndefined();
  });

  it('should handle fetch errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    const token = await getToken();

    expect(global.fetch).toHaveBeenCalled();
    expect(token).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Token fetch error:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle non-OK responses', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    const token = await getToken();

    expect(global.fetch).toHaveBeenCalled();
    expect(token).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Token fetch failed: 500 Internal Server Error');

    consoleSpy.mockRestore();
  });

  it('should reuse cached token if available', async () => {
    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    // First call should fetch
    await getToken();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Reset mock to verify it's not called again
    vi.clearAllMocks();

    // Second call should use cached token
    const token = await getToken();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(token).toBe('mock-token-123');
  });

  it('should refresh token when requested', async () => {
    const { getToken } = useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    // First call
    await getToken();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Should fetch again with refreshToken=true
    await getToken(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should automatically fetch token on init', async () => {
    useToken({
      tokenEndpoint: 'https://example.com/token',
      roomName: 'test-room',
      options: {
        userInfo: {
          identity: 'test-user',
        },
      },
    });

    // Need to wait for watchEffect to run
    await nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
