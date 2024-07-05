'use client';

// src/hooks/useCurrentUser.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const res = await axios.get('/api/users'); // Path to your API route
        setUser(res.data); // Assuming the API returns user data
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading, error };
}
