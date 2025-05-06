// ─── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  readingGoal: number;
  booksRead: number;
  currentlyReading?: BookshelfEntry | null;
  onboarded: boolean;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// ─── Book (Central Book Table) ─────────────────────────────────────────────────

export interface Book {
  id: number;
  isbn13: string;
  title: string;
  subjects?: string[];
  rating?: number;
  authors?: string[];
  pages?: number;
  image?: string;
  synopsis?: string;
  publisher?: string;
  date_published?: string;
  createdAt: string;
}

// ─── Bookshelf Entry (User Personalized Book Copy) ─────────────────────────────

export interface BookshelfEntry {
  id: number;
  userId: number;
  bookId: number;
  read: boolean;
  currentPage: number;
  rating?: number;
  addedAt: string;
  currentlyReading: boolean;

  // Include book data for convenience when needed
  book?: Book;
}

// ─── Book Club ─────────────────────────────────────────────────────────────────

export interface BookClub {
  id: number;
  name: string;
  ownerId: number;
  currentBook?: Book | null;
  members?: User[];
  memberCount?: number;
  created_at?: string;
}

// ─── Invite ────────────────────────────────────────────────────────────────────

export interface Invite {
  id: number;
  bookClubId: number;
  bookClubName?: string;
  invitedUserId: number;
  invitedById: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
