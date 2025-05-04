export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  coverUrl?: string;
  image?: string;
}

export interface BookClub {
  id: number;
  name: string;
}

export interface Invite {
  id: number;
  bookClubId: number;
  invitedUserId: number;
  invitedById: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
