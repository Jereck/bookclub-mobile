// User object shared across APIs
export interface User {
  id: number;
  username: string;
  email: string;
  readingGoal: number;
  booksRead: number;
  currentlyReading?: LibraryBook | null;
}

// Book in a user’s library
export interface LibraryBook {
  id: number;
  title: string;
  authors: string[];
  image?: string;
  coverUrl?: string;
  pages?: number;
  read?: boolean;
  overview?: string;
  synopsis?: string;
  datePublished?: string;
}

// Auth
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// Invite
export interface Invite {
  id: number;
  bookClubId: number;
  invitedUserId: number;
  invitedById: number;
  status: 'pending' | 'accepted';
  createdAt: string;
}

// Book Club
export interface BookClub {
  id: number;
  name: string;
  members?: User[];
}
