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

export const setCurrentlyReading = async (token: string, libraryEntryId: number) => {
  const res = await fetch(`${apiURL}/user/currentlyReading`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ libraryEntryId }),
  });
  if (!res.ok) throw new Error('Failed to set currently reading');
  return await res.json();
};

export const unsetCurrentlyReading = async (token: string) => {
  const res = await fetch(`${apiURL}/user/currentlyReading/unset`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to unset currently reading');
  return await res.json();
};