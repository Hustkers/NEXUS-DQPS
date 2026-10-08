import React from 'react';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const resolvedValues = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      data-slot='slider'
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment='edge'
      {...props}
    >
      <SliderPrimitive.Control className='relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col'>
        <SliderPrimitive.Track
          data-slot='slider-track'
          className='relative grow overflow-hidden rounded-full bg-zinc-800/50 dark:bg-zinc-800/60 select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5'
        >
          {/* Active range behind the knob */}
          <SliderPrimitive.Indicator
            data-slot='slider-range'
            className='bg-emerald-500 select-none data-horizontal:h-full data-vertical:w-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]'
          />
        </SliderPrimitive.Track>
        {Array.from({ length: resolvedValues.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot='slider-thumb'
            key={index}
            className='relative z-10 block size-3.5 shrink-0 rounded-full border border-zinc-200 bg-white dark:bg-zinc-100 shadow-md ring-ring/50 transition-[color,box-shadow,transform] select-none hover:scale-110 focus-visible:ring-2 focus-visible:outline-hidden active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing'
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export interface RangeSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  activeColor?: string;
  trackColor?: string;
}

/**
 * High-performance RangeSlider component for HTML range inputs.
 * Dynamically computes fill percentage so the background color is ONLY applied
 * to the active range behind the knob, leaving the unreached track neutral.
 */
export function RangeSlider({
  min = 0,
  max = 100,
  value,
  defaultValue,
  activeColor,
  trackColor = '#27272a',
  className,
  style,
  onChange,
  ...props
}: RangeSliderProps) {
  const [internalVal, setInternalVal] = React.useState<number>(
    Number(value ?? defaultValue ?? min)
  );

  const currentVal = value !== undefined ? Number(value) : internalVal;
  const numMin = Number(min);
  const numMax = Number(max);
  const pct = Math.max(0, Math.min(100, ((currentVal - numMin) / (numMax - numMin || 1)) * 100));

  // Extract accent color if provided via prop or class
  let fillColor = activeColor;
  if (!fillColor && className) {
    if (className.includes('accent-blue')) fillColor = '#3b82f6';
    else if (className.includes('accent-emerald')) fillColor = '#10b981';
    else if (className.includes('accent-amber')) fillColor = '#f59e0b';
    else if (className.includes('accent-cyan')) fillColor = '#06b6d4';
    else if (className.includes('accent-purple')) fillColor = '#a855f7';
    else if (className.includes('accent-indigo')) fillColor = '#6366f1';
    else if (className.includes('accent-zinc')) fillColor = '#e4e4e7';
  }
  const resolvedColor = fillColor || '#10b981';

  const dynamicBackground = {
    background: `linear-gradient(to right, ${resolvedColor} 0%, ${resolvedColor} ${pct}%, ${trackColor} ${pct}%, ${trackColor} 100%)`,
    ...style,
  };

  return (
    <input
      type='range'
      min={min}
      max={max}
      value={value}
      defaultValue={defaultValue}
      style={dynamicBackground}
      onChange={(e) => {
        setInternalVal(Number(e.target.value));
        onChange?.(e);
      }}
      className={cn(
        'w-full h-1.5 appearance-none rounded-full cursor-pointer focus:outline-none transition-all',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
        '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-zinc-300 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing',
        '[&::-moz-range-track]:bg-transparent',
        className
      )}
      {...props}
    />
  );
}

export { Slider };

