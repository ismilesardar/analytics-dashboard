import { NextRequest } from 'next/server';
import { z } from 'zod';

import { users } from '@/lib/server/dataset';
import { verifyPassword } from '@/lib/server/password';
import { ok, fail } from '@/lib/server/response';

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginBodySchema.safeParse(body);

  if (!parsed.success) {
    return fail('INVALID_REQUEST', 'Email and password are required.', 400);
  }

  const { email, password } = parsed.data;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !verifyPassword(password, user.password)) {
    return fail('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }

  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64url');

  return ok({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}
