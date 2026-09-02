import { useEffect, useRef } from 'react';
import { apiFetch } from '../../api.js';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const REFRESH_INTERVAL_MS = 60 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const STORAGE_THROTTLE_MS = 10 * 1000;
const LAST_ACTIVITY_KEY = 'hoopStats.lastActivity';
const LOGOUT_KEY = 'hoopStats.logout';

export default function useIdleSession({ isAuthenticated, setUser, setCurrentPage }) {
   const idleTimerRef = useRef(null);
   const lastActivityRef = useRef(0);
   const lastHandledActivityRef = useRef(0);
   const lastStoredActivityRef = useRef(0);
   const lastRefreshRef = useRef(0);
   const refreshInProgressRef = useRef(false);
   const sessionEndedRef = useRef(false);

   const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
         window.clearTimeout(idleTimerRef.current);
         idleTimerRef.current = null;
      }
   };

   const endSession = ({ broadcast = true } = {}) => {
      if (sessionEndedRef.current) {
         return;
      }

      sessionEndedRef.current = true;
      clearIdleTimer();
      localStorage.removeItem(LAST_ACTIVITY_KEY);

      if (broadcast) {
         localStorage.setItem(LOGOUT_KEY, String(Date.now()));
      }

      setUser(null);
      setCurrentPage('login');
   };

   useEffect(() => {
      if (!isAuthenticated) {
         sessionEndedRef.current = true;
         clearIdleTimer();
         return;
      }

      sessionEndedRef.current = false;
      const sessionStart = Date.now();
      lastActivityRef.current = sessionStart;
      lastHandledActivityRef.current = sessionStart;
      lastStoredActivityRef.current = sessionStart;
      lastRefreshRef.current = sessionStart;
      localStorage.removeItem(LOGOUT_KEY);
      localStorage.setItem(LAST_ACTIVITY_KEY, String(sessionStart));

      const expireSession = () => {
         if (sessionEndedRef.current) {
            return;
         }

         void apiFetch('/userAccount/logout', { method: 'POST' }).catch(() => { });
         endSession();
      };

      const scheduleIdleTimeout = () => {
         clearIdleTimer();
         const remainingTime = IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current);

         if (remainingTime <= 0) {
            expireSession();
            return;
         }

         idleTimerRef.current = window.setTimeout(expireSession, remainingTime);
      };

      const refreshSession = async () => {
         if (refreshInProgressRef.current || sessionEndedRef.current) {
            return;
         }

         refreshInProgressRef.current = true;
         try {
            const response = await apiFetch('/userAccount/session/refresh', { method: 'POST' });
            if (response.status === 401) {
               endSession();
               return;
            }

            if (response.ok) {
               lastRefreshRef.current = Date.now();
            }
         } catch {
            // A temporary connection failure should not end a session before its idle deadline.
         } finally {
            refreshInProgressRef.current = false;
         }
      };

      const recordActivity = () => {
         const now = Date.now();
         if (sessionEndedRef.current || now - lastHandledActivityRef.current < ACTIVITY_THROTTLE_MS) {
            return;
         }

         if (now - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
            expireSession();
            return;
         }

         lastHandledActivityRef.current = now;
         lastActivityRef.current = now;
         scheduleIdleTimeout();

         if (now - lastStoredActivityRef.current >= STORAGE_THROTTLE_MS) {
            lastStoredActivityRef.current = now;
            localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
         }

         if (now - lastRefreshRef.current >= REFRESH_INTERVAL_MS) {
            void refreshSession();
         }
      };

      const checkIdleDeadline = () => {
         if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
            expireSession();
         } else {
            scheduleIdleTimeout();
         }
      };

      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            checkIdleDeadline();
         }
      };

      const handleStorage = (event) => {
         if (event.key === LOGOUT_KEY && event.newValue) {
            endSession({ broadcast: false });
            return;
         }

         if (event.key !== LAST_ACTIVITY_KEY || !event.newValue) {
            return;
         }

         const sharedActivity = Number(event.newValue);
         if (!Number.isFinite(sharedActivity) || sharedActivity <= lastActivityRef.current) {
            return;
         }

         if (Date.now() - sharedActivity >= IDLE_TIMEOUT_MS) {
            expireSession();
            return;
         }

         lastActivityRef.current = sharedActivity;
         scheduleIdleTimeout();
      };

      const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'];
      activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
      window.addEventListener('focus', checkIdleDeadline);
      window.addEventListener('storage', handleStorage);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      scheduleIdleTimeout();

      return () => {
         clearIdleTimer();
         activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
         window.removeEventListener('focus', checkIdleDeadline);
         window.removeEventListener('storage', handleStorage);
         document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
   }, [isAuthenticated, setCurrentPage, setUser]);

   return endSession;
}