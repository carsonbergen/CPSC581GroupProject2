export function clamp(num, lower, upper) {
  // Code from:
  // https://www.omarileon.me/blog/javascript-clamp
  return Math.min(Math.max(num, lower), upper);
}
