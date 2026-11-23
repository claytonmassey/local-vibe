import * as SecureStore from "expo-secure-store";
import { createClient } from "@marketmap/api-client";

const KEY = "mm_token";

export function apiBase(): string {
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}

export async function saveToken(token: string | null): Promise<void> {
  if (!token) await SecureStore.deleteItemAsync(KEY);
  else await SecureStore.setItemAsync(KEY, token);
}

export const api = createClient({ baseUrl: apiBase(), getToken });
