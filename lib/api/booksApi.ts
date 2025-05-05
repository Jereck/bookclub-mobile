const apiURL = process.env.EXPO_PUBLIC_API_URL;
const isbnApiKey = process.env.EXPO_PUBLIC_ISBNDB_API_KEY;

export const searchBooks = async (query: string, token: string) => {
  const res = await fetch(`${apiURL}/books/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to search books");
  return res.json();
};

export const getBookByISBN = async (isbn13: string, token: string) => {
  const res = await fetch(`${apiURL}/books/isbn/${isbn13}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch book by ISBN");
  return res.json();
};

export const searchBooksByTitle = async (title: string) => {
  const response = await fetch(`https://api2.isbndb.com/books/${encodeURIComponent(title)}`, {
    headers: {
      Authorization: isbnApiKey!,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ISBNdb Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.books;
};