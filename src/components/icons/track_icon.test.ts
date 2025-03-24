import VideoOffIcon from '@/assets/icons/video-off.svg?component';
import VideoOnIcon from '@/assets/icons/video.svg?component';
import { mount } from '@vue/test-utils';
import { Track } from 'livekit-client';
import { describe, expect, suite } from 'vitest';
import TrackIcon from './TrackIcon.vue';

describe('TrackIcon', () => {
  suite('Source is Track.Source.Camera', () => {
    const wrapper = mount(TrackIcon, {
      props: {
        source: Track.Source.Camera,
        enabled: false,
      },
    });

    expect(wrapper.findComponent(VideoOffIcon).exists()).toBe(true);
    expect(wrapper.findComponent(VideoOnIcon).exists()).toBe(false);
  });
});
