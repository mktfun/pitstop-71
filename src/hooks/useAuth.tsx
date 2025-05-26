
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de usuário autenticado
    const checkUser = () => {
      const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
      const userEmail = localStorage.getItem('userEmail');
      
      if (isLoggedIn && userEmail) {
        // Simular userId baseado no email para consistência
        const userId = `user_${btoa(userEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`;
        setUser({ id: userId, email: userEmail });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  return { user, isLoading };
};
