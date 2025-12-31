import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import logo from '../assets/worldcup-logo.png';
import googleLogo from '../assets/g-logo.png';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignIn() {
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
      <div className="relative border border-white/10 bg-black/50 rounded-lg px-4 py-16 w-[400px] flex flex-col items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:w-[80%] after:h-8 after:bg-linear-to-b after:from-black/40 after:to-transparent after:blur-md after:rounded-[100%]">
      <img
        src={logo}
        alt="World Cup 2026 Pool"
        className="w-[200px]"
      />
      <h1 className="text-2xl font-bold mb-6 text-center pt-4">World Cup 2026 Pool</h1>
      {error && (
        <p className="text-red-500 mb-4 text-center">{error}</p>
      )}
      <Button
        onClick={handleGoogleLogin}
        className="w-[300px]"
      >
        <img src={googleLogo} alt="Google" className="w-6 h-6 mr-2" />
        Sign in with Google
      </Button>
      </div>
    </PageContainer>
  );
}
