import { StateCreator } from 'zustand'

export interface Club {
  id: number
  name: string
}

export interface Invite {
  id: number
  bookClubId: number
  invitedById: number
  status: 'pending' | 'accepted'
  createdAt: string
}

export interface BookClubSlice {
  clubs: Club[]
  invites: Invite[]
  clubsTotal: number
  invitesTotal: number
  clubsPage: number
  invitesPage: number
  clubsNeedsRefresh: boolean
  invitesNeedsRefresh: boolean
  setClubs: (clubs: Club[], total: number) => void
  setInvites: (invites: Invite[], total: number) => void
  setClubsPage: (page: number) => void
  setInvitesPage: (page: number) => void
  setClubsNeedsRefresh: (refresh: boolean) => void
  setInvitesNeedsRefresh: (refresh: boolean) => void
  resetBookClubs: () => void
}

export const createBookClubSlice: StateCreator<BookClubSlice, [], [], BookClubSlice> = (set) => ({
  clubs: [],
  invites: [],
  clubsTotal: 0,
  invitesTotal: 0,
  clubsPage: 1,
  invitesPage: 1,
  clubsNeedsRefresh: false,
  invitesNeedsRefresh: false,

  setClubs: (clubs, total) => set({ clubs, clubsTotal: total }),
  setInvites: (invites, total) => set({ invites, invitesTotal: total }),
  setClubsPage: (page) => set({ clubsPage: page }),
  setInvitesPage: (page) => set({ invitesPage: page }),
  setClubsNeedsRefresh: (refresh) => set({ clubsNeedsRefresh: refresh }),
  setInvitesNeedsRefresh: (refresh) => set({ invitesNeedsRefresh: refresh }),
  resetBookClubs: () =>
    set({
      clubs: [],
      invites: [],
      clubsTotal: 0,
      invitesTotal: 0,
      clubsPage: 1,
      invitesPage: 1,
    }),
})
