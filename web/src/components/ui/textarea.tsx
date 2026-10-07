import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-[4px] border border-input bg-background px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-card disabled:text-muted-foreground disabled:opacity-50 aria-invalid:border-foreground md:text-sm',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
