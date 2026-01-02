import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components';
import { AuthProvider, MatchProvider } from './context';
import { EditProfile, Home, Rules, UserProfile } from './routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MatchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/:userName" element={<UserProfile />} />
          </Routes>
        </BrowserRouter>
      </MatchProvider>
    </AuthProvider>
  </StrictMode>
);
