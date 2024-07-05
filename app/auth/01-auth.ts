'use server';

import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import {
  FormState,
  LoginFormSchema,
  SignupFormSchema,
} from '@/app/auth/definitions';
import {
  createDbSession,
  deleteDbSession,
} from '@/app/auth/02-database-session'; // Ensure correct import
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getUser } from './03-dal';

export async function signup(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      message: 'Email already exists, please use a different email or login.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const data = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({ id: users.id });

  const user = data[0];

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    };
  }

  const userId = user.id;
  await createDbSession(userId);

  redirect('/dashboard');
}

export async function login(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  const errorMessage = { message: 'Invalid login credentials.' };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, validatedFields.data.email),
  });

  if (!user) {
    return errorMessage;
  }

  const passwordMatch = await bcrypt.compare(
    validatedFields.data.password,
    user.password,
  );

  if (!passwordMatch) {
    return errorMessage;
  }

  const userId = user.id;
  await createDbSession(userId);

  redirect('/dashboard');
}

export async function logout() {
  try {
    const user = await getUser(); // get the current logged-in user
    if (!user) {
      console.log('No user logged in');
      return {
        message: 'No user logged in',
      };
    }

    const userId = user.id;
    console.log('Logging out user with ID:', userId);

    const result = await deleteDbSession(userId);
    if (result.success) {
      console.log('Successfully logged out');
    } else {
      console.log('Failed to log out');
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}
