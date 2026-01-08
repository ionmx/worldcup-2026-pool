import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components';
import { AuthProvider, MatchProvider, LeagueProvider, ToastProvider } from './context';
import {
  About,
  EditLeague,
  EditProfile,
  Home,
  JoinLeague,
  Leaderboard,
  LeagueDetail,
  Leagues,
  NewLeague,
  Rules,
  UserProfile,
} from './routes';

// Hide splash screen - exposed globally so components can call it
window.hideSplash = () => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 300);
  }
};

// Extend Window interface
declare global {
  interface Window {
    hideSplash: () => void;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <LeagueProvider>
          <MatchProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/leagues" element={<Leagues />} />
                <Route
                  path="/leagues/new"
                  element={
                    <ProtectedRoute>
                      <NewLeague />
                    </ProtectedRoute>
                  }
                />
                <Route path="/league/:slug" element={<LeagueDetail />} />
                <Route
                  path="/league/:slug/join/:inviteCode"
                  element={<JoinLeague />}
                />
                <Route
                  path="/league/:slug/edit"
                  element={
                    <ProtectedRoute>
                      <EditLeague />
                    </ProtectedRoute>
                  }
                />
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
        </LeagueProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
