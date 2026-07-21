/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapacitorApp } from '@capacitor/app';
import MobileLayout from './layouts/MobileLayout';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import ReelsPage from './pages/ReelsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import EditProfilePage from './pages/EditProfilePage';
import KYCPage from './pages/settings/KYCPage';
import KYCDocumentSelectionPage from './pages/settings/KYCDocumentSelectionPage';
import KYCCameraPage from './pages/settings/KYCCameraPage';
import SettingsPage from './pages/settings/SettingsPage';

import PrivacyPage from './pages/settings/PrivacyPage';
import SecurityPage from './pages/settings/SecurityPage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OwnerDashboard from './pages/admin/OwnerDashboard';
import AdminLogin from './pages/admin/AdminLogin';

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener: { remove: () => void } | null = null;

    const setupListener = async () => {
      try {
        listener = await CapacitorApp.addListener('backButton', () => {
          const isRootPage = ['/', '/login', '/welcome', '/register', '/matches', '/chat', '/reels', '/profile'].includes(location.pathname);
          if (isRootPage) {
            CapacitorApp.exitApp();
          } else {
            navigate(-1);
          }
        });
      } catch (e) {
        // Fallback for browser environment where CapacitorApp may not be loaded
      }
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [navigate, location]);

  return null;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Dismiss splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const applyStyles = () => {
      if (document.hidden) return;
      
      const el1 = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(4) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1)');
      if (el1) {
        (el1 as HTMLElement).style.width = '327px';
      }

      const el2 = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(7) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > span:nth-of-type(2)');
      if (el2) {
        (el2 as HTMLElement).style.height = '54px';
        (el2 as HTMLElement).style.width = '94.3438px';
      }

      const el3 = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(7) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(2)');
      if (el3) {
        (el3 as HTMLElement).style.fontSize = '13px';
      }

      const el4 = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(6)');
      if (el4) {
        (el4 as HTMLElement).style.paddingLeft = '24px';
        (el4 as HTMLElement).style.paddingRight = '24px';
        (el4 as HTMLElement).style.paddingBottom = '0px';
      }

      // Make the heart icon beat dynamically
      const el5 = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > svg:nth-of-type(1) > path:nth-of-type(1)');
      if (el5) {
        (el5 as HTMLElement).style.transformOrigin = 'center';
        (el5 as HTMLElement).style.animation = 'heartbeat 1.2s infinite ease-in-out';
      }

      const el5_svg = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > svg:nth-of-type(1)');
      if (el5_svg) {
        (el5_svg as HTMLElement).style.transformOrigin = 'center';
        (el5_svg as HTMLElement).style.animation = 'heartbeat 1.2s infinite ease-in-out';
      }
    };
    // Run multiple times to catch dynamic renders, with visibility-check to conserve resource
    const interval = setInterval(applyStyles, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Glowing blur effects behind the icon */}
            <div className="absolute w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-75 pointer-events-none" />

            <div className="relative flex flex-col items-center">
              {/* Outer logo container with breathing animation & rotating border glow */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.1
                }}
                className="relative"
              >
                {/* Rotating glow ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1.5 rounded-[2.2rem] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-60 blur-md"
                />

                {/* Main Logo Card */}
                <motion.div
                  className="relative w-24 h-24 bg-gradient-to-tr from-pink-500 via-pink-600 to-purple-600 rounded-[2.2rem] flex items-center justify-center shadow-[0_15px_35px_rgba(236,72,153,0.3)] border border-white/10 overflow-hidden"
                >
                  {/* Subtle inner animated gradient swipe */}
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                  />
                  
                  {/* Custom heart icon with beating/pulsing motion */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                  >
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white fill-white"
                      style={{ filter: 'drop-shadow(0px 2px 5px rgba(236,72,153,0.3))' }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Brand Name Text with staggering slide-up */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-center select-none"
              >
                <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Matchdeck
                </h1>
                <p className="text-[9px] text-pink-500 font-bold uppercase tracking-[0.3em] mt-1.5">
                  TrueMatch AI
                </p>
              </motion.div>

              {/* Progress Bar / Interactive Line Loader */}
              <div className="w-28 h-[2px] bg-white/5 rounded-full mt-10 relative overflow-hidden">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-full w-24 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/" element={<MobileLayout />}>
            <Route index element={<DiscoverPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="reels" element={<ReelsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="profile/settings/kyc" element={<KYCPage />} />
            <Route path="profile/settings/kyc/document" element={<KYCDocumentSelectionPage />} />
            <Route path="profile/settings/kyc/camera" element={<KYCCameraPage />} />
            <Route path="profile/settings/general" element={<SettingsPage />} />

            <Route path="profile/settings/privacy" element={<PrivacyPage />} />
            <Route path="profile/settings/security" element={<SecurityPage />} />
          </Route>
          <Route path="admin" element={<OwnerDashboard />} />
          <Route path="admin/login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
