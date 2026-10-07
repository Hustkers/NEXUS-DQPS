'use client';

import { ConstellationField } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

export function BackgroundShader() {
  return (
    <div
      className='fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 select-none'
      aria-hidden='true'
    >
      <div className='shader-frame w-full h-full pointer-events-none'>
        <ConstellationField
          variant='interface-lines'
          mode='dark'
          speed={1.0}
          size={1.0}
          length={1.0}
          density={1.0}
          opacity={1.0}
          hue={0}
          saturation={1.0}
          brightness={1.0}
        />
      </div>
    </div>
  );
}

export default BackgroundShader;
