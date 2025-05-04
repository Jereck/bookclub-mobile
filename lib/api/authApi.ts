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