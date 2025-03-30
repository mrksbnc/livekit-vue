import { useGridLayout } from '@/composables/useGridLayout';
import * as coreModule from '@livekit/components-core';
import * as vueUseCore from '@vueuse/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, shallowRef } from 'vue';

vi.mock('@livekit/components-core', () => ({
  GRID_LAYOUTS: [
    { columns: 1, rows: 1, minTiles: 1, maxTiles: 1 },
    { columns: 2, rows: 1, minTiles: 2, maxTiles: 2 },
    { columns: 2, rows: 2, minTiles: 3, maxTiles: 4 },
    { columns: 3, rows: 2, minTiles: 5, maxTiles: 6 },
    { columns: 3, rows: 3, minTiles: 7, maxTiles: 9 },
  ],
  selectGridLayout: vi.fn(),
}));

vi.mock('@vueuse/core', () => ({
  useElementSize: vi.fn(),
}));

describe('useGridLayout', () => {
  const mockGridElement = {
    style: {
      setProperty: vi.fn(),
    },
  } as unknown as HTMLDivElement;

  const mockLayoutResult: coreModule.GridLayoutInfo = {
    name: 'mock-layout',
    columns: 2,
    rows: 2,
    minWidth: 800,
    minHeight: 600,
    maxTiles: 4,
  };

  const mockWidth = ref(800);
  const mockHeight = ref(600);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(vueUseCore, 'useElementSize').mockReturnValue({
      width: shallowRef(mockWidth.value),
      height: shallowRef(mockHeight.value),
      stop: vi.fn(),
    });

    vi.spyOn(coreModule, 'selectGridLayout').mockReturnValue(mockLayoutResult);
  });

  it('should initialize with the element size and default layouts', () => {
    const gridElement = ref(mockGridElement);

    useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(vueUseCore.useElementSize).toHaveBeenCalledWith(gridElement);
    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(coreModule.GRID_LAYOUTS, 4, 800, 600);
  });

  it('should use custom layouts when provided', () => {
    const gridElement = ref(mockGridElement);
    const customLayouts = [
      { columns: 1, rows: 1, minTiles: 1, maxTiles: 2 },
      { columns: 2, rows: 2, minTiles: 3, maxTiles: 6 },
    ];

    useGridLayout({
      trackCount: 4,
      gridElement,
      layouts: customLayouts,
    });

    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(customLayouts, 4, 800, 600);
  });

  it('should return layout and container dimensions', () => {
    const gridElement = ref(mockGridElement);

    const result = useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(result.layout.value).toBe(mockLayoutResult);
    expect(result.containerWidth.value).toBe(800);
    expect(result.containerHeight.value).toBe(600);
  });

  it('should update layout when trackCount changes', () => {
    const gridElement = ref(mockGridElement);
    const trackCount = ref(4);

    useGridLayout({
      trackCount: trackCount.value,
      gridElement,
    });

    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(coreModule.GRID_LAYOUTS, 4, 800, 600);

    vi.clearAllMocks();
    trackCount.value = 6;

    useGridLayout({
      trackCount: trackCount.value,
      gridElement,
    });

    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(coreModule.GRID_LAYOUTS, 6, 800, 600);
  });

  it('should update layout when container dimensions change', () => {
    const gridElement = ref(mockGridElement);

    useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(coreModule.GRID_LAYOUTS, 4, 800, 600);

    vi.clearAllMocks();
    mockWidth.value = 1024;
    mockHeight.value = 768;

    useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(coreModule.selectGridLayout).toHaveBeenCalledWith(coreModule.GRID_LAYOUTS, 4, 800, 600);
  });

  it('should set CSS variables on the grid element', () => {
    const gridElement = ref(mockGridElement);

    useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(mockGridElement.style.setProperty).toHaveBeenCalledWith('--lk-col-count', '2');
    expect(mockGridElement.style.setProperty).toHaveBeenCalledWith('--lk-row-count', '2');
  });

  it('should not set CSS variables when grid element is undefined', () => {
    const gridElement = ref(null as unknown as HTMLDivElement);

    useGridLayout({
      trackCount: 4,
      gridElement,
    });

    expect(mockGridElement.style.setProperty).not.toHaveBeenCalled();
  });
});
