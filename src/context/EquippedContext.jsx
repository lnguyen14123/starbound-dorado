// EquippedContext.jsx
import { createContext, useState, useContext } from "react";

const EquippedContext = createContext();

export const EquippedProvider = ({ children }) => {
  const [equipped, setEquipped] = useState({
    pet: { hat_item: null, collar_item: null, breed_item: null },
    room: { wall_item: null, floor_item: null, decor_item: null },
  });

  return (
    <EquippedContext.Provider value={{ equipped, setEquipped }}>
      {children}
    </EquippedContext.Provider>
  );
};

export const useEquipped = () => useContext(EquippedContext);
