import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SoundContext = createContext({
  masterVolume: 0.5,
  setMasterVolume: () => {},
  sfxVolume: 0.5,
  setSfxVolume: () => {},
  petVolume: 0.5,
  setPetVolume: () => {},
});

const getStoredNumber = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = parseFloat(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
};

export const SoundProvider = ({ children }) => {
  const [masterVolume, setMasterVolume] = useState(() =>
    getStoredNumber("sound_master", 0.6)
  );
  const [sfxVolume, setSfxVolume] = useState(() =>
    getStoredNumber("sound_sfx", 0.6)
  );
  const [petVolume, setPetVolume] = useState(() =>
    getStoredNumber("sound_pet", 0.6)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sound_master", String(masterVolume));
  }, [masterVolume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sound_sfx", String(sfxVolume));
  }, [sfxVolume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sound_pet", String(petVolume));
  }, [petVolume]);

  const value = useMemo(
    () => ({
      masterVolume,
      setMasterVolume,
      sfxVolume,
      setSfxVolume,
      petVolume,
      setPetVolume,
    }),
    [masterVolume, sfxVolume, petVolume]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSoundSettings = () => useContext(SoundContext);
