const apiURL = process.env.EXPO_PUBLIC_API_URL;

export const getBookRecommendations = async (token: string) => {
  const res = await fetch(`${apiURL}/recommendations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch book recommendations");
  }

  return await res.json();
};