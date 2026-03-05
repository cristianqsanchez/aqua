'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getUser } from '@/components/providers/user.actions';

type User = {
  displayName: string;
  email: string;
  roleLabel?: string;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialUser: User | null;
};

export function UserProvider({ children, initialUser }: Props) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refreshUser = useCallback(async () => {
    try {
      const u = await getUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (initialUser) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const u = await getUser();
        if (!mounted) return;
        setUser(u);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
