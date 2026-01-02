import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { worldcupLogo, googleLogo } from '../assets';
import { Button, Card, PageContainer } from '../components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SignIn = () => {
  const [error, setError] = React.useState<string | null>(null);
  const { userData } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userData) {
      void navigate(`/${userData.userName}`, { replace: true });
    }
  }, [userData, navigate]);

  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'An error occurred');
    });
  };

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <Card className="px-4 py-16 w-[400px] flex flex-col items-center justify-center">
        <img
          src={worldcupLogo}
          alt="World Cup 2026 Pool"
          className="w-[200px]"
        />
        <h1 className="text-2xl font-light mb-6 text-center pt-4">
          FIFA WORLD CUP 2026 POOL
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <Button onClick={handleGoogleLogin} className="w-[300px]">
          <img src={googleLogo} alt="Google" className="w-6 h-6 mr-2" />
          Sign in with Google
        </Button>
      </Card>
    </PageContainer>
  );
};
