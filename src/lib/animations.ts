/**
 * Animation utility helpers used across the booking system.
 */

/**
 * Returns an inline style object with a staggered animation-delay
 * so that list items enter one after another.
 *
 * @param index - zero-based position of the item in the list
 * @param baseMs - delay per item in milliseconds (default 40 ms)
 */
export function staggerStyle(
  index: number,
  baseMs = 40,
): React.CSSProperties {
  return { animationDelay: `${index * baseMs}ms` };
}

/**
 * Combines the stagger utility class with an animation-delay style.
 * Use this as: className={staggerClass(i)} style={staggerStyle(i)}
 */
export function staggerClass(): string {
  return 'animate-stagger-in';
}
