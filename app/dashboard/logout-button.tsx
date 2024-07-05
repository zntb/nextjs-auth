'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { logout } from '@/app/auth/01-auth';
import { LogOutIcon } from '@/components/ui/icons';

export default function LogoutButton() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return;
  }

  const logoutHandler = async () => {
    await logout();

    router.push('/login');
  };
  return (
    <button
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-900"
      onClick={logoutHandler}
    >
      <LogOutIcon className="h-4 w-4" />
      Logout
    </button>
  );
}
