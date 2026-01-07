import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
