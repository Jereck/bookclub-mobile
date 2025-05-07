import { LoginResponse, RegisterResponse } from "./types";

const apiURL = process.env.EXPO_PUBLIC_API_URL;

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${apiURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return  {token: data.token, user: data.user };
};

export const registerUser = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch(`${apiURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return await response.json();
};

export const getPresignedProfileUploadUrl = async (token: string): Promise<{ uploadUrl: string; key: string }> => {
  const response = await fetch(`${apiURL}/user/profile-picture`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { uploadUrl, key } = await response.json();
  return { uploadUrl, key };
};

export const uploadProfilePicture = async (
  uploadUrl: string,
  file: Blob
): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg'
    },
    body: file
  });

  if (!res.ok) {
    throw new Error('Failed to upload image to S3');
  }
};

export const getProfileImageUrl = async (token: string): Promise<string | null> => {
  const response = await fetch(`${apiURL}/user/profile-image`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile image URL');
  }

  const { url } = await response.json();
  return url;
};