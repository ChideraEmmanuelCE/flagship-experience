"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyProfile, readProfile, STORAGE_KEY, type Profile } from "@/lib/drive";

export default function useDriveProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const latest = useRef(profile);
  useEffect(() => {
    try { setProfile(readProfile(localStorage.getItem(STORAGE_KEY))); }
    catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    latest.current = profile;
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [profile, ready]);
  const checkpoint = useCallback((updater: (previous: Profile) => Profile) => {
    const next = updater(latest.current);
    latest.current = next;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { /* The visible storage warning covers disabled storage. */ }
  }, []);
  return { profile, setProfile, ready, storageError, checkpoint };
}
