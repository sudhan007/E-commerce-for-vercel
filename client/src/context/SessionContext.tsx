// src/context/SessionContext.tsx
import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { _axios } from '@/lib/axios';

export type SessionContextType = {
  _id: string;
  mobile: number;
  username: string;
  prefferedCusine: string;
  fcmToken: string;
  role: string;
  profileImage: string;
  refCode: string;
  referedBy: string | null;
  email: string;
  active: boolean;
  favorites: string[] | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isPending: boolean;
  address: string;
} | null;

const SessionContext = createContext<SessionContextType>(null);

export default function SessionContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useQuery<SessionContextType>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await _axios.get('/user/userauth/session');
      return {...response.data.data, isPending: false} as SessionContextType;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <SessionContext.Provider value={session ?? null}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook
export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within SessionContextProvider');
  }
  return context;
};