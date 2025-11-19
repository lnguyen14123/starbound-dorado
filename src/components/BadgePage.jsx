import React, { useState, useEffect } from "react";

import Award1 from "../assets/badges/Award1.png";
import Award2 from "../assets/badges/Award2.png";
import Award3 from "../assets/badges/Award3.png";
import Calendar1 from "../assets/badges/Calendar1.png";
import Calendar2 from "../assets/badges/Calendar2.png";
import Calendar3 from "../assets/badges/Calendar3.png";
import Compass1 from "../assets/badges/Compass1.png";
import Compass2 from "../assets/badges/Compass2.png";
import Compass3 from "../assets/badges/Compass3.png";
import Pen1 from "../assets/badges/Pen1.png";
import Pen2 from "../assets/badges/Pen2.png";
import Pen3 from "../assets/badges/Pen3.png";

const badgeImageMap = {
  "Award1.png": Award1,
  "Award2.png": Award2,
  "Award3.png": Award3,
  "Calendar1.png": Calendar1,
  "Calendar2.png": Calendar2,
  "Calendar3.png": Calendar3,
  "Compass1.png": Compass1,
  "Compass2.png": Compass2,
  "Compass3.png": Compass3,
  "Pen1.png": Pen1,
  "Pen2.png": Pen2,
  "Pen3.png": Pen3,
};

function BadgePage({ onClose, onBadgesViewed }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/badges/${uid}`);
        if (!response.ok) throw new Error("Failed to fetch badges");
        
        const data = await response.json();
        setBadges(data.badges || []);
      } catch (error) {
        console.error("Error fetching badges:", error);
        try {
          const catalogResponse = await fetch(`/api/badges/catalog`);
          if (catalogResponse.ok) {
            const catalogData = await catalogResponse.json();
            const lockedBadges = (catalogData.badges || []).map(badge => ({
              ...badge,
              acquired: false
            }));
            setBadges(lockedBadges);
          } else {
            setBadges([]);
          }
        } catch (catalogError) {
          console.error("Error fetching badge catalog:", catalogError);
          setBadges([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, []);

  // Notify parent when badges are viewed
  useEffect(() => {
    if (onBadgesViewed && !loading) {
      onBadgesViewed();
    }
  }, [loading, onBadgesViewed]);

  // Helper function to get badge image from path
  const getBadgeImage = (assetPath) => {
    if (!assetPath) return null;
    // Extract filename from badge's path
    const filename = assetPath.split("/").pop() || assetPath;
    return badgeImageMap[filename] || null;
  };

  if (loading) {
    return (
      <div className="w-133 h-[calc(100vh-170px)] mt-[1vh] p-1 overflow-y-auto will-change-transform">
        <div className="w-full bg-[var(--color-surface-raised)] rounded-2xl p-3 flex items-center justify-center">
          <span className="text-[var(--color-text)] font-dongle text-2xl">Loading badges...</span>
        </div>
      </div>
    );
  }

  
  return (
    <div className="w-133 h-[calc(100vh-170px)] mt-[1vh] p-1 overflow-y-auto will-change-transform">
      <div className="w-full bg-[var(--color-surface-raised)] rounded-2xl p-3">
        <div className="grid grid-cols-3 gap-4 w-full p-1">
          {badges.map((badge) => {
            const isLocked = !badge.acquired;
            const badgeImage = getBadgeImage(badge.asset_path);

            return (
              <div
                key={badge.badge_id}
                className={`bg-[var(--color-card)] rounded-2xl w-full aspect-square shadow-md 
                  flex items-center justify-center transition duration-300 
                  ${isLocked ? "opacity-50 grayscale-[40%] cursor-not-allowed" : "hover:shadow-xl hover:scale-105 cursor-pointer"}`}
                title={badge.display_name || badge.badge_id}
              >
                {badgeImage ? (
                  <img
                    src={badgeImage}
                    alt={badge.display_name || badge.badge_id}
                    className={`w-3/4 h-3/4 object-contain ${isLocked ? "grayscale-[40%]" : ""}`}
                  />
                ) : (
                  <span className="text-[var(--color-text)] font-dongle text-sm text-center px-2">
                    {badge.display_name || badge.badge_id}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(BadgePage);
