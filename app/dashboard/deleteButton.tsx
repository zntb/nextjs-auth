'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { deleteUser } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { logout } from '../auth/01-auth';

export const DeleteButton = () => {
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

  const deleteUserHandler = async () => {
    if (confirm('Are you sure you want to delete your account?')) {
      console.log('Deleting user');
      await deleteUser();
      console.log('Logging out');
      await logout();
      router.push('/login');
    }
  };

  return (
    <Button onClick={deleteUserHandler} className="ml-auto mt-10 w-3/12">
      Delete Account
    </Button>
  );
};
