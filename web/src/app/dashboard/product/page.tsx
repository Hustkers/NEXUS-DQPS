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
      pageTitle='Product Catalog'
      pageDescription='Omnichannel inventory levels, SKU pricing, and catalog synchronization.'
      infoContent={productInfoContent}
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Link
            href='/dashboard/strategy-engine'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'text-xs md:text-sm border-[#39FF14]/40 text-[#39FF14] hover:bg-[#39FF14]/10 hover:text-[#39FF14] font-mono'
            )}
          >
            <Icons.bot className='mr-2 h-4 w-4 text-[#39FF14]' /> Strategy Engine
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
