import { useParams } from 'react-router-dom';
import { PageContainer, NavBar } from '../components';

export const UserProfile = () => {
  const { userName } = useParams();

  return (
    <PageContainer className="flex flex-col items-center justify-center relative">
      <NavBar />
      <h1 className="text-4xl font-bold">Welcome, {userName}!</h1>
    </PageContainer>
  );
}

