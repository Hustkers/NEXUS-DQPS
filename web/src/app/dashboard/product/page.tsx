import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import ProductListingPage from '@/features/products/components/product-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { productInfoContent } from '@/config/infoconfig';

export const metadata = {
  title: 'Dashboard: Products'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Products'
      pageDescription='Manage products (React Query + nuqs table pattern.)'
      infoContent={productInfoContent}
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Link
            href='/dashboard/strategy-engine'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'text-xs md:text-sm border-emerald-600/40 dark:border-[#39FF14]/40 text-emerald-600 dark:text-[#39FF14] hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-[#39FF14] font-mono'
            )}
          >
            <Icons.bot className='mr-2 h-4 w-4 text-emerald-600 dark:text-[#39FF14]' /> AI Strategy Engine
          </Link>
          <Link href='/dashboard/product/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
            <Icons.add className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
      }
    >
      <ProductListingPage />
    </PageContainer>
  );
}
