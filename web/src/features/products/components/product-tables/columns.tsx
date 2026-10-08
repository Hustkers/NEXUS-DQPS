'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Product } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'photo_url',
    header: 'IMAGE',
    cell: ({ row, table }) => {
      const url = row.getValue('photo_url') as string;
      const name = row.getValue('name') as string;
      const onAnalyze = (table.options.meta as any)?.onAnalyze;
      return (
        <div
          className='relative size-12 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 cursor-pointer hover:border-cyan-500/80 transition-colors'
          onClick={() => onAnalyze?.(row.original)}
          title='Click to inspect product telemetry'
        >
          {url ? (
            <Image
              src={url}
              alt={name || 'Nike Shoe'}
              fill
              sizes='48px'
              className='object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center text-[10px] text-zinc-600'>
              NIKE
            </div>
          )}
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Shoe Model' />
    ),
    cell: ({ row, table }) => {
      const p = row.original;
      const onAnalyze = (table.options.meta as any)?.onAnalyze;
      return (
        <div
          className='max-w-[260px] cursor-pointer group'
          onClick={() => onAnalyze?.(p)}
          title='Click to inspect product telemetry'
        >
          <div className='font-medium text-zinc-100 truncate group-hover:text-cyan-400 transition-colors'>
            {p.name}
          </div>
          {p.sku && (
            <div className='text-[10px] font-mono text-zinc-500'>SKU: {p.sku}</div>
          )}
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search Nike shoes...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    enableSorting: false,
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ cell }) => {
      const cat = cell.getValue<Product['category']>();
      return (
        <Badge variant='outline' className='font-mono text-[10px] border-zinc-700 text-zinc-300'>
          {cat}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'categories',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const p = row.original;
      const usdPrice = Number(p.price || 0);
      return (
        <div className='font-mono'>
          <div className='text-zinc-900 dark:text-zinc-100 font-bold'>${usdPrice.toFixed(2)}</div>
        </div>
      );
    }
  },
  {
    id: 'inventory',
    accessorKey: 'inventory',
    header: 'Inventory / Stock',
    cell: ({ row }) => {
      const p = row.original;
      const stock = (p as any).inventory ?? 150;
      const isCritical = stock <= 0;
      return (
        <div className='flex items-center gap-1.5 text-xs font-mono'>
          <span className={cn('font-bold', isCritical ? 'text-rose-400' : 'text-emerald-400')}>
            {stock} units
          </span>
          <span className='text-zinc-500 text-[11px]'>
            {isCritical ? '(Stockout)' : '(In Stock)'}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ cell }) => (
      <div className='max-w-[320px] truncate text-xs text-zinc-400'>
        {cell.getValue<string>()}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row, table }) => (
      <CellAction
        data={row.original}
        onAnalyze={(table.options.meta as any)?.onAnalyze}
      />
    )
  }
];
