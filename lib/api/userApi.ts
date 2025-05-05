const apiURL = process.env.EXPO_PUBLIC_API_URL;

export const getUserProfile = async (token: string) => {
  const res = await fetch(`${apiURL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return await res.json();
};

export const updateUserReadingGoal = async (token: string, readingGoal: number) => {
  const res = await fetch(`${apiURL}/user/readingGoal`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ readingGoal }),
  });
  if (!res.ok) throw new Error('Failed to update reading goal');
  return await res.json();
};