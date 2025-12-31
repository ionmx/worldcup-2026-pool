import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components';
import { AuthProvider } from './context';
import { EditProfile, SignIn, UserProfile } from './routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/:userName" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
