import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthProvider';
import SignIn from './routes/signin';
import UserProfile from './routes/user-profile';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/:userName" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
