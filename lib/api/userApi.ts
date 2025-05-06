import { User } from "./types";

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
  const res = await fetch(`${apiURL}/user/update`, {
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

export const updateUser = async (token: string, data: Partial<User>) => {
  const res = await fetch(`${apiURL}/user/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data}),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return await res.json();
};