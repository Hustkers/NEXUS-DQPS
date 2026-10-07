'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' className='relative h-8 w-8 rounded-full border border-emerald-500/30 bg-emerald-950/20'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-emerald-950 text-emerald-400 font-mono text-xs font-bold'>NX</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className='w-56 bg-zinc-950 border-zinc-800' align='end' sideOffset={10}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-semibold text-zinc-100 flex items-center gap-1.5'>
                Nexus AI Operator
                <span className='size-1.5 rounded-full bg-emerald-400' />
              </p>
              <p className='text-muted-foreground text-xs leading-none font-mono'>
                operator@nexus-d2c.internal
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-zinc-800' />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/overview')} className='cursor-pointer text-xs'>
            <Icons.dashboard className='mr-2 h-3.5 w-3.5 text-emerald-400' />
            Mission Control
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/simulator')} className='cursor-pointer text-xs'>
            <Icons.code className='mr-2 h-3.5 w-3.5 text-cyan-400' />
            Scenario Injector
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/ledger')} className='cursor-pointer text-xs'>
            <Icons.check className='mr-2 h-3.5 w-3.5 text-emerald-400' />
            Decision Ledger
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-zinc-800' />
        <div className='p-2 text-[10px] text-zinc-500 font-mono'>
          SYS_STATUS: OPTIMIZING (OK)
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
