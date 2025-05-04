const apiURL = process.env.EXPO_PUBLIC_API_URL;

export const getBookClubs = async (token: string) => {
  const res = await fetch(`${apiURL}/bookclub`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch book clubs");
  return res.json();
};

export const getBookClubDetails = async (token: string, id: number) => {
  const res = await fetch(`${apiURL}/bookclub/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch club details");
  return await res.json();
};

export const createBookClub = async (token: string, name: string) => {
  const res = await fetch(`${apiURL}/bookclub`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create book club");
  return res.json();
};

export const getBookClubMembers = async (token: string, clubId: number) => {
  const res = await fetch(`${apiURL}/bookclub/${clubId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch book club members");
  return res.json();
};

export const searchUserByEmail = async (token: string, email: string) => {
  const res = await fetch(`${apiURL}/user/search?email=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("User not found");
  return await res.json();
};

export const sendBookClubInvite = async (
  token: string,
  clubId: number,
  invitedUserId: number
) => {
  console.log("Club ID:", clubId);
  const res = await fetch(`${apiURL}/bookclub/${clubId}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invitedUserId }),
  });
  if (!res.ok) throw new Error("Failed to send invite");
  return await res.json();
};

export const getBookClubInvites = async (token: string) => {
  const res = await fetch(`${apiURL}/bookclub/invites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch invites");
  return res.json();
};

export const acceptBookClubInvite = async (token: string, inviteId: number) => {
  const res = await fetch(`${apiURL}/bookclub/invites/${inviteId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to accept invite");
  return res.json();
};