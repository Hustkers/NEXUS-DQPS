import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const salesData = [
  {
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
    fallback: 'OM',
    amount: '+₹1,999.00'
  },
  {
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
    fallback: 'JL',
    amount: '+₹39.00'
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
    fallback: 'IN',
    amount: '+₹299.00'
  },
  {
    name: 'William Kim',
    email: 'will@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
    fallback: 'WK',
    amount: '+₹99.00'
  },
  {
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
    fallback: 'SD',
    amount: '+₹39.00'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full bg-card border-border shadow-none text-card-foreground'>
      <CardHeader>
        <CardTitle className='text-foreground'>Recent Transactions</CardTitle>
        <CardDescription className='text-muted-foreground'>265 orders processed this telemetry cycle.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {salesData.map((sale, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9 border border-border'>
                <AvatarImage src={sale.avatar} alt='Avatar' />
                <AvatarFallback className='bg-muted text-foreground text-xs'>{sale.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium text-foreground'>{sale.name}</p>
                <p className='text-muted-foreground text-xs'>{sale.email}</p>
              </div>
              <div className='ml-auto text-foreground text-sm font-semibold'>{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
