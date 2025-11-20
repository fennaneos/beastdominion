// src/hooks/useUserData.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

// ============================================================
// 🔧 DEV MODE FLAG
// ============================================================
const DEV_MODE = true; // ⬅️ SWITCH HERE

export default function useUserData() {
  // ------------------------------------------------------------
  //  React hooks MUST ALWAYS be declared unconditionally
  // ------------------------------------------------------------
  const [devMockData, setDevMockData] = useState(null);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // DEV MODE – INITIALIZE LOCAL MOCK DATA **ONE TIME**
  // ============================================================
  useEffect(() => {
    if (!DEV_MODE) return;

    console.log("🔥 DEV MODE: Local mock Firestore enabled");

    // Initialize local mock DB
    setDevMockData({
      gold: 999,
      shards: 50,
      stamina: 100,
      deck: [],
      upgrades: {},
      progress: {
        darkwood: { maxUnlockedLevel: 5, completedLevels: [0, 1, 2, 3, 4] },
      },
    });

    // Simulate a Firebase user
    setUser({
      uid: "DEV_USER",
      displayName: "Dev Player",
    });

    setLoading(false);
  }, []);

  // ============================================================
  // DEV MODE — updateUserData (local only)
  // ============================================================
  const devUpdateUserData = (fields) => {
    console.log("⚙️ DEV MODE — updateUserData:", fields);

    setDevMockData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  // ============================================================
  // RETURN DEV MODE RESULT (ALWAYS SAME HOOK SHAPE)
  // ============================================================
  if (DEV_MODE) {
    return {
      user: user,
      data: devMockData,
      updateUserData: devUpdateUserData,
      loading,
    };
  }

  // ============================================================
  // NORMAL FIREBASE MODE BELOW
  // ============================================================
  useEffect(() => {
    if (DEV_MODE) return; // skip firebase

    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      setUser(u);

      if (!u) {
        setData(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      // ---------------------------------------
      // If user doc doesn't exist → create it
      // ---------------------------------------
      if (!snap.exists()) {
        const initial = {
          gold: 1000,
          shards: 50,
          stamina: 100,
          lastStaminaReset: new Date().toISOString(),
          deck: [],
          upgrades: {},
          progress: {
            darkwood: { maxUnlockedLevel: 0, completedLevels: [] },
          },
        };

        await setDoc(ref, initial);
      }

      // ---------------------------------------
      // Real-time Firestore sync
      // ---------------------------------------
      const unsubRT = onSnapshot(ref, async (docSnap) => {
        if (!docSnap.exists()) return;

        let d = docSnap.data();
        const fix = {};

        // Basic validation
        if (!Array.isArray(d.deck)) fix.deck = [];
        if (!d.upgrades || typeof d.upgrades !== "object") fix.upgrades = {};

        // Ensure progress exists
        if (!d.progress)
          fix.progress = {
            darkwood: { maxUnlockedLevel: 0, completedLevels: [] },
          };

        // Daily stamina reset
        const today = new Date().toDateString();
        const last = new Date(d.lastStaminaReset).toDateString();
        if (today !== last) {
          fix.stamina = 100;
          fix.lastStaminaReset = new Date().toISOString();
        }

        // Apply corrections
        if (Object.keys(fix).length) {
          await updateDoc(ref, fix);
          d = { ...d, ...fix };
        }

        setData(d);
        setLoading(false);
      });

      return () => unsubRT();
    });

    return () => unsubAuth();
  }, []);

  // ============================================================
  // FIREBASE MODE — updateUserData
  // ============================================================
  const firebaseUpdateUserData = async (fields) => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, fields);
  };

  // ============================================================
  // RETURN NORMAL FIREBASE RESULT
  // ============================================================
  return {
    user,
    data,
    updateUserData: firebaseUpdateUserData,
    loading,
  };
}
