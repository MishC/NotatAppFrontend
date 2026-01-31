export function getWidthBucket(width, step = 100) {
  return Math.floor(width / step) * step;
}

const width = window.innerWidth;
export const isMobile = width <= 640;
export const isTablet = width > 640 && width <= 850;

export const isDesktop = width > 850;