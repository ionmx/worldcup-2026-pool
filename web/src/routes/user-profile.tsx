import { useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { NavBar } from '../components/NavBar';

export default function UserProfile() {
  const { userName } = useParams();

  return (
    <PageContainer className="flex flex-col items-center justify-center relative">
      <NavBar />
      <h1 className="text-4xl font-bold">Welcome, {userName}!</h1>
    </PageContainer>
  );
}
