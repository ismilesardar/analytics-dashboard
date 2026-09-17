import Link from 'next/link';
import { LineChart } from 'lucide-react';

import { LoginForm } from '@/features/auth/login-form';
import { LoginBrandPanel } from '@/features/auth/login-brand-panel';

export default function LoginPage() {
  return (
    <div className='flex min-h-svh bg-slate-50 dark:bg-slate-950'>
      <LoginBrandPanel />

      <div className='flex flex-1 flex-col items-center justify-center p-6'>
        <div className='w-full max-w-sm'>
          <Link href='/' className='mb-8 flex items-center gap-2 md:hidden'>
            <span className='flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-orange-400 font-bold text-white'>
              <LineChart className='size-4' />
            </span>
            <span className='text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50'>
              Pulse
            </span>
          </Link>

          <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50'>
            Sign in
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Enter your email and password to continue.
          </p>

          <div className='mt-8'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
