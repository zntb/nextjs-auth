// src/utils/auth.ts
export async function fetchCurrentUser() {
  try {
    const response = await fetch('/api/auth/current-user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
