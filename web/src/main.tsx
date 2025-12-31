import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context';
import { EditProfile, SignIn, UserProfile } from './routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/:userName" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
