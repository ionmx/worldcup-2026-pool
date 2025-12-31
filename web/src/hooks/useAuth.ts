import { use } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => use(AuthContext);
