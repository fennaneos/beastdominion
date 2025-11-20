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

export default function useUserData() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      setUser(u);

      if (!u) {
        setData(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      let userData;
      if (!snap.exists()) {
        userData = {
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

        await setDoc(ref, userData);
      } else {
        userData = snap.data();
      }

      // Set initial data immediately to prevent null reference errors
      setData(userData);

      // Start real-time updates
      const unsubRT = onSnapshot(ref, async (docSnap) => {
        if (!docSnap.exists()) return;

        let d = docSnap.data();
        const fix = {};

        if (!Array.isArray(d.deck)) fix.deck = [];
        if (!d.upgrades || typeof d.upgrades !== "object") fix.upgrades = {};
        if (!d.progress)
          fix.progress = { darkwood: { maxUnlockedLevel: 0, completedLevels: [] } };

        // Stamina reset
        const today = new Date().toDateString();
        const last = new Date(d.lastStaminaReset).toDateString();
        if (today !== last) {
          fix.stamina = 100;
          fix.lastStaminaReset = new Date().toISOString();
        }

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

  // Helper for FIELD UPDATES
  const updateUserData = async (fields) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, fields);
  };

  return { user, data, updateUserData, loading };
}