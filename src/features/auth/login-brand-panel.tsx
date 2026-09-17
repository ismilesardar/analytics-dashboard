import Link from 'next/link';
import { ArrowUpRight, LineChart, Users } from 'lucide-react';

const stats = [
  { label: 'Revenue', value: '$128.4k', trend: '+12.4%' },
  { label: 'Orders', value: '1,204', trend: '+6.1%' }
];

export function LoginBrandPanel() {
  return (
    <div className='relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-orange-500 p-10 text-white md:flex md:w-[42%]'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 overflow-hidden'
      >
        <div className='absolute -top-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl' />
        <div className='absolute right-0 bottom-0 size-80 rounded-full bg-white/10 blur-3xl' />
      </div>

      <Link href='/' className='relative flex items-center gap-2'>
        <span className='flex size-8 items-center justify-center rounded-xl bg-white/20 font-bold backdrop-blur-sm'>
          <LineChart className='size-4' />
        </span>
        <span className='text-lg font-semibold tracking-tight'>Pulse</span>
      </Link>

      <div className='relative'>
        <h2 className='text-3xl font-bold tracking-tight text-balance'>
          Every metric that runs your business, in one place.
        </h2>
        <p className='mt-3 max-w-xs text-indigo-100/80'>
          Revenue, orders, and customer activity — tracked live and ready the
          moment you sign in.
        </p>

        <div className='mt-8 grid grid-cols-2 gap-3'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-2xl bg-white/10 p-4 backdrop-blur-sm'
            >
              <p className='text-xs text-indigo-100/70'>{stat.label}</p>
              <p className='mt-1 text-xl font-semibold'>{stat.value}</p>
              <p className='mt-1 flex items-center gap-1 text-xs text-emerald-200'>
                <ArrowUpRight className='size-3' />
                {stat.trend}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className='relative flex items-center gap-1.5 text-xs text-indigo-100/60'>
        <Users className='size-3.5' />
        Built for a frontend take-home assignment.
      </p>
    </div>
  );
}
