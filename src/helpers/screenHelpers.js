export function getWidthBucket(width, step = 100) {
  return Math.floor(width / step) * step;
}


export function isMobile(width) {
  return width <= 640;
}
export function isTablet(width){

     return width > 640 && width <= 850; //bool
}
export function isDesktop(width) {
  return width > 850;
}