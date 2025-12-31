import { UserMenu } from './UserMenu';

export const NavBar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 flex justify-end p-4">
      <UserMenu />
    </nav>
  );
};
