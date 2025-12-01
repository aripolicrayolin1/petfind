'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '../lib/firebase'; // Corregido
import type { User } from '../types'; // Corregido

// 1. Definición del "contrato" del contexto.
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  reloadUserData: () => Promise<void>;
}

// 2. Creación del contexto con valores por defecto.
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  reloadUserData: async () => {},
});

// 3. Componente "Proveedor" que envolverá la aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
    if (!firebaseUser) return null;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as DocumentData;
      const user: User = {
        id: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'Usuario Anónimo',
        email: data.email || firebaseUser.email || '',
        avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
        avatarHint: data.avatarHint || '',
        phone: data.phone || '',
        pets: data.pets || [],
        createdAt: data.createdAt || new Date().toISOString(),
        auth: firebaseUser,
      };
      return user;
    } else {
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Usuario Anónimo',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || '',
        avatarHint: `Avatar para ${firebaseUser.displayName || 'un nuevo usuario'}`,
        phone: '',
        pets: [],
        createdAt: new Date().toISOString(),
        auth: firebaseUser,
      };
      
      const { auth, ...userDataToSave } = newUser;
      await setDoc(userDocRef, userDataToSave);
      
      return newUser;
    }
  }, []);

  const reloadUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setLoading(true);
      const userData = await fetchUserData(user);
      setCurrentUser(userData);
      setLoading(false);
      window.dispatchEvent(new Event('storage'));
    }
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      const userData = await fetchUserData(user);
      setCurrentUser(userData);
      setLoading(false);
      window.dispatchEvent(new Event('storage'));
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ currentUser, loading, reloadUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personalizado para consumir el contexto fácilmente.
export const useAuth = () => useContext(AuthContext);
