'use client';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation } from '../utils/types';

const statusDotColor = {
  online: 'bg-green-500',
  offline: 'bg-red-500'
} as const;

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <header className='flex flex-wrap items-center justify-between gap-3 sm:gap-4'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <div className='relative'>
          <Avatar className='border-border/40 bg-card/80 text-foreground h-10 w-10 rounded-2xl border sm:h-12 sm:w-12 sm:rounded-3xl'>
            <AvatarFallback className='bg-primary/20 text-primary rounded-2xl text-sm font-semibold sm:rounded-3xl sm:text-base'>
              {conversation.initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'border-background absolute right-0 bottom-0 inline-flex h-3 w-3 rounded-full border-2 sm:h-3.5 sm:w-3.5',
              statusDotColor[conversation.status]
            )}
            aria-label={conversation.status === 'online' ? 'Online' : 'Offline'}
          />
        </div>
        <div>
          <p className='text-foreground text-sm font-semibold sm:text-base'>{conversation.name}</p>
          <p className='text-muted-foreground text-xs sm:text-sm'>{conversation.title}</p>
        </div>
      </div>

      <div className='flex items-center gap-1.5 sm:gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => {
            toast.info(`Calling ${conversation.name}...`, {
              description: 'Encrypted WebRTC voice channel initialized.'
            });
          }}
          className='border-border/40 bg-background/60 text-muted-foreground hover:bg-muted/60 focus-visible:ring-primary/40 focus-visible:ring-offset-background size-8 rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-10'
          aria-label='Start audio call'
        >
          <Icons.phone className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => {
            toast.info(`Starting video call with ${conversation.name}...`, {
              description: 'Secure 1080p stream negotiated.'
            });
          }}
          className='border-border/40 bg-background/60 text-muted-foreground hover:bg-muted/60 focus-visible:ring-primary/40 focus-visible:ring-offset-background size-8 rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-10'
          aria-label='Start video call'
        >
          <Icons.video className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='border-border/40 bg-background/60 text-muted-foreground hover:bg-muted/60 focus-visible:ring-primary/40 focus-visible:ring-offset-background size-8 rounded-full border transition focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-10'
                aria-label='Open conversation menu'
              >
                <Icons.ellipsis className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
              </Button>
            }
          />
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem
              onClick={() => {
                const data = JSON.stringify(conversation, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-${conversation.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Chat transcript exported');
              }}
            >
              <Icons.download className='mr-2 size-4' />
              Export Transcript
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(conversation.id || conversation.name);
                toast.success('Conversation ID copied to clipboard');
              }}
            >
              <Icons.copy className='mr-2 size-4' />
              Copy Channel ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.info(`Notifications muted for ${conversation.name}`);
              }}
            >
              <Icons.notification className='mr-2 size-4' />
              Mute Notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
