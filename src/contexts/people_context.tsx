import React, { createContext, useContext, useState, useEffect } from 'react';
import { Person } from '../models/app_types';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from './auth_context';

interface PeopleContextType {
  people: Person[];
}

const PeopleContext = createContext<PeopleContextType>({
  people: [],
});

export const usePeople = () => useContext(PeopleContext);

export const PeopleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (user && user.groupe) {
      const q = query(collection(db, 'users'), where('groupe', '==', user.groupe));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const p: Person[] = [];
        snapshot.forEach(doc => p.push({ id: doc.id, ...doc.data() } as Person));
        setPeople(p);
      });
      return () => unsubscribe();
    } else {
      setPeople([]);
    }
  }, [user]);

  return (
    <PeopleContext.Provider value={{ people }}>
      {children}
    </PeopleContext.Provider>
  );
};
