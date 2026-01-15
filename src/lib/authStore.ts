import { create } from "zustand";

type AuthUser = {
  id: string;
  username: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearAuth: () => void;
};

const COOKIE_KEY = "geomoments_auth";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const parts = document.cookie.split("; ").filter(Boolean);
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return null;
  return found.substring(name.length + 1);
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=; path=/; max-age=0`;
};

const loadInitialState = (): Pick<
  AuthState,
  "user" | "accessToken" | "refreshToken"
> => {
  if (typeof document === "undefined") {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
    };
  }

  try {
    const raw = readCookie(COOKIE_KEY);
    if (!raw) {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
      };
    }
    const parsed = JSON.parse(decodeURIComponent(raw)) as {
      user?: AuthUser | null;
      accessToken?: string | null;
      refreshToken?: string | null;
    };
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
    };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitialState(),
  setAuth: ({ user, accessToken, refreshToken }) => {
    const next = { user, accessToken, refreshToken };
    set(next);
    writeCookie(
      COOKIE_KEY,
      encodeURIComponent(JSON.stringify(next)),
      60 * 60 * 24 * 7
    );
  },
  clearAuth: () => {
    const cleared = { user: null, accessToken: null, refreshToken: null };
    set(cleared);
    clearCookie(COOKIE_KEY);
  },
}));
