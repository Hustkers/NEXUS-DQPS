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
          <Button variant='ghost' className='relative h-8 w-8 rounded-full border border-[#8A8A8A] bg-[#1A1A1A]'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-[#1A1A1A] text-white font-mono text-xs font-bold'>NX</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className='w-56 bg-[#1A1A1A] border-[#8A8A8A] shadow-none' align='end' sideOffset={10}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-semibold text-white flex items-center gap-1.5'>
                Nexus AI Operator
                <span className='size-1.5 rounded-full bg-white' />
              </p>
              <p className='text-[#8A8A8A] text-xs leading-none font-mono'>
                operator@nexus-d2c.internal
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-[#8A8A8A]' />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/overview')} className='cursor-pointer text-xs text-white hover:bg-[#000000]'>
            <Icons.dashboard className='mr-2 h-3.5 w-3.5 text-white' />
            Mission Control
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/simulator')} className='cursor-pointer text-xs text-white hover:bg-[#000000]'>
            <Icons.terminal className='mr-2 h-3.5 w-3.5 text-[#8A8A8A]' />
            Scenario Injector
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/ledger')} className='cursor-pointer text-xs text-white hover:bg-[#000000]'>
            <Icons.check className='mr-2 h-3.5 w-3.5 text-white' />
            Decision Ledger
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-[#8A8A8A]' />
        <div className='p-2 text-[10px] text-[#8A8A8A] font-mono'>
          SYS_STATUS: OPTIMIZING (OK)
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
