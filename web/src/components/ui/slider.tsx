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
      <SliderPrimitive.Control className='relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col py-1.5'>
        {/* Visible background color trough behind the track */}
        <div
          aria-hidden='true'
          className='absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-zinc-950/80 dark:bg-zinc-950/80 border border-zinc-800/80 shadow-inner pointer-events-none data-vertical:inset-x-auto data-vertical:inset-y-0 data-vertical:left-1/2 data-vertical:-translate-x-1/2 data-vertical:w-2.5'
        />
        <SliderPrimitive.Track
          data-slot='slider-track'
          className='relative grow overflow-hidden rounded-full bg-zinc-800/90 dark:bg-zinc-800 border border-zinc-700/40 select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5 shadow-inner'
        >
          <SliderPrimitive.Indicator
            data-slot='slider-range'
            className='bg-primary select-none data-horizontal:h-full data-vertical:w-full'
          />
        </SliderPrimitive.Track>
        {Array.from({ length: resolvedValues.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot='slider-thumb'
            key={index}
            className='relative z-10 block size-3.5 shrink-0 rounded-full border border-zinc-400/60 bg-zinc-100 dark:bg-zinc-100 shadow-md ring-ring/50 transition-[color,box-shadow,transform] select-none after:absolute after:-inset-2 hover:scale-110 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing'
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
