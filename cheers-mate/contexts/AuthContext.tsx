import { createContext, useContext } from 'react';
import { User } from '../types/user';
import { getUserById, CURRENT_USER_ID } from '../data/mockUsers';

const currentUser = getUserById(CURRENT_USER_ID)!;

interface AuthContextValue {
  user: User;
}

const AuthContext = createContext<AuthContextValue>({ user: currentUser });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
