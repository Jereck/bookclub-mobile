const apiURL = process.env.EXPO_PUBLIC_API_URL;
const isbnApiKey = process.env.EXPO_PUBLIC_ISBNDB_API_KEY;

export const getUserLibrary = async (token: string) => {
  const response = await fetch(`${apiURL}/library`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch library');
  }

  const data = await response.json();
  return data;
};

export const addBookToLibrary = async (
  book: {
    title: string;
    isbn13: string;
    authors: string[];
    pages: number;
    image: string;
    overview: string;
    synopsis: string;
    date_published: string;
  },
  token: string
) => {
  const response = await fetch(`${apiURL}/library`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add book: ${error}`);
  }

  return await response.json();
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

export const getBookFromLibrary = async (bookId: number, token: string) => {
  const response = await fetch(`${apiURL}/library/${bookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }

  return await response.json();
};

export const removeBookFromLibrary = async (bookId: number, token: string) => {
  const res = await fetch(`${apiURL}/library/${bookId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete book');
  }

  return await res.json();
};