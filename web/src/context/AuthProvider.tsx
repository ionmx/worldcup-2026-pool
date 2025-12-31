import React from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { handleUserLogin, type UserData } from '../services';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        handleUserLogin(currentUser)
          .then((data) => {
            setUserData(data);
          })
          .catch((error: unknown) => {
            console.error('Error fetching user data:', error);
            setUserData(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData
  };

  return (
    <AuthContext value={value}>
      {!loading && children}
    </AuthContext>
  );
};
