'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { login } from './api';
import { loginSchema, type LoginFormValues } from './login-schema';
import { useAuthStore } from './store';

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // Pre-filled with the seeded mock user (src/data/users.json) so
    // reviewers can sign in immediately without hunting for credentials.
    defaultValues: { email: 'admin@pulse.dev', password: 'admin1234' },
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data);
      router.push('/');
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      toast.error(
        error.response?.data?.error?.message ??
          'Could not log in. Check your details and try again.'
      );
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <FormField
        control={form.control}
        name='email'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type='email'
                placeholder='you@company.com'
                autoComplete='email'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type='password'
                placeholder='••••••••'
                autoComplete='current-password'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type='submit'
        className='w-full'
        disabled={mutation.isPending || !form.formState.isValid}
      >
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </Form>
  );
}
