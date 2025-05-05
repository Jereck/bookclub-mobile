const apiURL = process.env.EXPO_PUBLIC_API_URL;

export const getUserBookshelf = async (token: string) => {
  const res = await fetch(`${apiURL}/bookshelf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user bookshelf");
  return res.json();
};

export const getBookshelfEntry = async (token: string, bookId: number) => {
  const res = await fetch(`${apiURL}/bookshelf/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch bookshelf entry");
  return res.json();
};

export const addToBookshelf = async (token: string, bookId: number) => {
  const res = await fetch(`${apiURL}/bookshelf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookId }),
  });
  if (!res.ok) throw new Error("Failed to add book to bookshelf");
  return res.json();
};

export const updateBookshelfEntry = async (token: string, entryId: number, data: any) => {
  const res = await fetch(`${apiURL}/bookshelf/${entryId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bookshelf entry");
  return res.json();
};

export const getCurrentlyReadingBooks = async (token: string) => {
  const res = await fetch(`${apiURL}/bookshelf/currentlyReading`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch currently reading books");
  return res.json();
};

export const markAsCurrentlyReading = async (token: string, bookId: number) => {
  const res = await fetch(`${apiURL}/bookshelf/${bookId}/currentlyReading`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to mark book as currently reading");
  return res.json();
};

export const unmarkCurrentlyReading = async (token: string, bookId: number) => {
  const res = await fetch(`${apiURL}/bookshelf/${bookId}/currentlyReading`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to unmark book as currently reading");
  return res.json();
};