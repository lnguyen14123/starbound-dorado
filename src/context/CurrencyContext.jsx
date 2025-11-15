import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(0);

// CurrencyContext.jsx (inside useEffect)
useEffect(() => {
  async function fetchCurrency() {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    const res = await fetch(`/api/user/currency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });

    if (!res.ok) {
      console.error("Failed to fetch currency", await res.text());
      return;
    }

    const data = await res.json();
    // backend returns { currency: <number> }
    setCurrency(data.currency ?? 0);
  }
  fetchCurrency();
}, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
