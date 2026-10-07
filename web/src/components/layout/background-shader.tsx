'use client';

import { useTheme } from 'next-themes';
import { ConstellationField } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function BackgroundShader() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = !mounted || resolvedTheme === 'dark';

  return (
    <div
      className='fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 select-none'
      aria-hidden='true'
    >
      <div className='shader-frame w-full h-full pointer-events-none'>
        <ConstellationField
          variant='interface-lines'
          mode={isDark ? 'dark' : 'light'}
          speed={1.0}
          size={1.0}
          length={1.0}
          density={1.0}
          opacity={isDark ? 1.0 : 0.4}
          hue={0}
          saturation={1.0}
          brightness={1.0}
        />
      </div>
    </div>
  );
}

export default BackgroundShader;
