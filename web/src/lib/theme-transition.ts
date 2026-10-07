/**
 * Animate a theme change with a circular ripple reveal expanding from the pointer position,
 * matching context-hackdevengers (https://context-hackdevengers.vercel.app/) and Vengeance UI.
 * Uses View Transitions API with Web Animations API clipPath animation on ::view-transition-new(root).
 */
export function startThemeTransition(
  apply: () => void,
  origin?:
    | { clientX?: number; clientY?: number; currentTarget?: any; target?: any }
    | React.MouseEvent
    | MouseEvent
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

  let x = typeof window !== 'undefined' ? window.innerWidth - 48 : 0;
  let y = 32;

  if (origin) {
    if (typeof origin.clientX === 'number' && origin.clientX > 0) {
      x = origin.clientX;
      y = typeof origin.clientY === 'number' ? origin.clientY : 32;
    } else if (
      'currentTarget' in origin &&
      origin.currentTarget &&
      typeof (origin.currentTarget as any).getBoundingClientRect === 'function'
    ) {
      const rect = (origin.currentTarget as any).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (
      'target' in origin &&
      origin.target &&
      typeof (origin.target as any).getBoundingClientRect === 'function'
    ) {
      const rect = (origin.target as any).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  }

  const endRadius =
    typeof window !== 'undefined'
      ? Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )
      : 1500;

  // Set CSS custom properties on documentElement for native CSS keyframe execution (Safari & Chromium)
  document.documentElement.style.setProperty('--vt-x', `${Math.round(x)}px`);
  document.documentElement.style.setProperty('--vt-y', `${Math.round(y)}px`);
  document.documentElement.style.setProperty('--vt-r', `${Math.ceil(endRadius)}px`);

  try {
    const transition = (document as any).startViewTransition(() => {
      apply();
    });

    transition.ready
      .then(() => {
        try {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${Math.round(x)}px ${Math.round(y)}px)`,
                `circle(${Math.ceil(endRadius)}px at ${Math.round(x)}px ${Math.round(y)}px)`
              ]
            },
            {
              duration: 400,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)'
            } as any
          );
        } catch (_) {
          // If WAAPI pseudoElement is unsupported (e.g. Safari), native CSS @keyframes vt-reveal handles it smoothly
        }
      })
      .catch(() => {});
  } catch {
    apply();
  }
}
