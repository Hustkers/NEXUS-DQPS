/**
 * Animate a theme change with a circular ripple reveal expanding from the pointer position,
 * matching context-hackdevengers (https://context-hackdevengers.vercel.app/) and Vengeance UI.
 * Uses View Transitions API with Web Animations API clipPath animation on ::view-transition-new(root).
 */
export function startThemeTransition(
  apply: () => void,
  origin?: { clientX?: number; clientY?: number }
) {
  if (
    typeof document === 'undefined' ||
    !(document as any).startViewTransition ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    apply();
    return;
  }

  const x =
    origin?.clientX ??
    (typeof window !== 'undefined' ? window.innerWidth - 48 : 0);
  const y = origin?.clientY ?? 32;
  const endRadius =
    typeof window !== 'undefined'
      ? Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )
      : 1000;

  try {
    const transition = (document as any).startViewTransition(() => {
      apply();
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 380,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          } as any
        );
      })
      .catch(() => {});
  } catch {
    apply();
  }
}
