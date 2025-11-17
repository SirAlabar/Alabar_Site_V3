/**
 * Mathematical utility functions for reuse across the project
 */

/**
 * Linear interpolation helper
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number
{
  return start + (end - start) * t;
}

/**
 * Constrain a value between min and max
 * @param value - Value to constrain
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Bounded value
 */
export function boundValue(value: number, min: number, max: number): number
{
  return Math.min(Math.max(value, min), max);
}
