import { createContext, useContext, useEffect, useState } from "react";
import type { MeDto, SessionDto } from "@marketmap/contracts";
import { api, getToken, saveToken } from "./api";

type SessionValue = {
  ready: boolean;
  me: MeDto | null;
  signUp: (name: string, email: string, password: string) => Promise<SessionDto>;
  signIn: (email: string, password: string) => Promise<SessionDto>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<MeDto | null>(null);

  async function refresh() {
    const token = await getToken();
    if (!token) {
      setMe(null);
      return;
    }
    setMe(await api.me());
  }

  useEffect(() => {
    refresh()
      .catch(() => setMe(null))
      .finally(() => setReady(true));
  }, []);

  async function signUp(name: string, email: string, password: string) {
    const session = await api.signUp({ name, email, password });
    await saveToken(session.token);
    await refresh();
    return session;
  }

  async function signIn(email: string, password: string) {
    const session = await api.signIn({ email, password });
    await saveToken(session.token);
    await refresh();
    return session;
  }

  async function signOut() {
    try {
      await api.signOut();
    } catch {
      // The local token still has to go.
    }
    await saveToken(null);
    setMe(null);
  }

  return <SessionContext.Provider value={{ ready, me, signUp, signIn, signOut, refresh }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session missing");
  return value;
}
