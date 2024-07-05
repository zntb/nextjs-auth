import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { decrypt } from '../../auth/02-database-session';
import { fetchUsers } from '../../actions/user';

interface User {
  id: number;
  name: string;
  email: string;
}

export async function GET(req: NextRequest, res: NextResponse<User | null>) {
  try {
    const cookie = cookies().get('session')?.value;

    if (!cookie) {
      return new NextResponse(null, { status: 401 });
    }
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return new NextResponse(null, { status: 401 });
    }

    const users = await fetchUsers();

    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error) {
    // Handle errors appropriately
    console.error('Error fetching user:', error);
    return new NextResponse(null, { status: 500 });
  }
}
