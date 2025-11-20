import React, { useState, useEffect } from "react";
import "../index.css";
import user_icon from "../assets/icons/User.svg"
import Checkmark from "../assets/icons/checkmark.png";
import StreakFire from "../assets/icons/streak_fire.png";
import achievements from "../assets/icons/achievements.svg"
import { auth } from "../firebase";

export default function FriendsPage({ onClose, onPendingRequestsChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentUid, setCurrentUid] = useState(null);
  const [friendBadgeCounts, setFriendBadgeCounts] = useState({});
  useEffect(() => {
    const uid = localStorage.getItem("uid");
    setCurrentUid(uid);
    if (uid) {
      fetchFriends(uid);
      fetchPendingRequests(uid);
    }
  }, []);

  const fetchFriends = async (uid) => {
    try {
      const response = await fetch(`/api/friends/${uid}`);
      const data = await response.json();
      const friendsList = data.friends || [];
      setFriends(friendsList);
      
      // Fetch badge counts for each friend
      const badgeCountsMap = {};
      for (const friend of friendsList) {
        try {
          const badgesResponse = await fetch(`/api/badges/${friend.friend_uid}`);
          if (badgesResponse.ok) {
            const badgesData = await badgesResponse.json();
            // Count only acquired badges
            const acquiredCount = (badgesData.badges || []).filter(badge => badge.acquired).length;
            badgeCountsMap[friend.friend_uid] = acquiredCount;
          } else {
            badgeCountsMap[friend.friend_uid] = 0;
          }
        } catch (err) {
          console.error(`Error fetching badges for friend ${friend.friend_uid}:`, err);
          badgeCountsMap[friend.friend_uid] = 0;
        }
      }
      setFriendBadgeCounts(badgeCountsMap);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const fetchPendingRequests = async (uid) => {
    try {
      const response = await fetch(`/api/friends/requests/${uid}`);
      const data = await response.json();
      const requests = data.requests || [];
      setPendingRequests(requests);
      // Update the notification badge count
      if (onPendingRequestsChange) {
        onPendingRequestsChange(requests.length);
      }
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const searchUsers = async (username) => {
    if (!username.trim() || !currentUid) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/users/search?username=${encodeURIComponent(username)}&currentUid=${currentUid}`
      );
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchUsers(value);
  };

  const sendFriendRequest = async (receiverUid) => {
    if (!currentUid) return;

    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUid: currentUid,
          receiverUid: receiverUid,
        }),
      });

      if (response.ok) {
        await response.json();
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
      } else {
        const error = await response.json();
        const errorMessage = error.error || "";
        
        const silentErrors = [
          "already sent",
          "already exists",
          "already friends",
          "previously declined"
        ];
        
        const shouldSilentlyIgnore = silentErrors.some(silentError => 
          errorMessage.toLowerCase().includes(silentError.toLowerCase())
        );
        
        // Only alert on actual errors (not found, database errors, etc.)
        if (!shouldSilentlyIgnore) {
          alert(errorMessage || "Failed to send friend request");
        }
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert("Failed to send friend request");
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    if (!currentUid) return;

    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          uid: currentUid,
        }),
      });

      if (response.ok) {
        // Refresh friends list and pending requests
        await fetchFriends(currentUid);
        await fetchPendingRequests(currentUid);
        window.dispatchEvent(new CustomEvent("badgesUpdated"));
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${status} friend request`);
      }
    } catch (err) {
      console.error(`Error ${status}ing friend request:`, err);
      alert(`Failed to ${status} friend request`);
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col w-full">
        <div className=" mt-[1vh] h-[calc(100vh-270px)] w-133 max-w-4xl p-8 bg-[var(--color-surface-raised)] rounded-2xl border-2 border-[var(--color-border-strong)] overflow-y-auto">
          {/* Pending Friend Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-5xl font-dongle font-bold text-[var(--color-text)] mb-4">
                Friend Requests
              </h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.request_id}
                    className="bg-[var(--color-card)] rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-4xl font-dongle text-[var(--color-text)] font-semibold">
                        {request.username}
                      </p>
                      <p className="text-3xl font-dongle text-[var(--color-muted)] opacity-90">
                        {request.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestResponse(request.request_id, "accepted")}
                        className="px-4 py-2 bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-lg text-3xl font-dongle font-bold hover:bg-[var(--color-success-hover)] transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestResponse(request.request_id, "declined")}
                        className="px-4 py-2 bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] rounded-lg text-3xl font-dongle font-bold hover:bg-[var(--color-danger-hover)] transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Section */}
          {showSearch && (
            <div className="mb-6">
              <h2 className="text-5xl font-dongle font-bold text-[var(--color-text)] mb-4">
                Search Users
              </h2>
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input-bg)] border-2 border-[var(--color-border-strong)] text-4xl font-dongle text-[var(--color-text)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-input-ring)]"
              />
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.uid}
                      className="bg-[var(--color-card)] rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-4xl font-dongle text-[var(--color-text)] font-semibold">
                          {user.username}
                        </p>
                        
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.uid)}
                        className="px-4 py-2 bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)] rounded-lg text-3xl font-dongle font-bold hover:bg-[var(--color-button-primary-hover)] transition"
                      >
                        Send Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-4xl font-dongle text-[var(--color-text)] text-center py-4">
                  No users found
                </p>
              )}
            </div>
          )}

          {/* Friends List Section */}
          <div>
            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.friend_uid}
                    className="bg-[var(--color-card)] rounded-xl p-4"
                  >
              

                    <div className="flex items-center justify-between">
                      <img src={user_icon} alt="User_icon" className="w-10"/>
      
                      <div>
                        <p className="text-4xl font-dongle text-[var(--color-text)] font-semibold">
                          {friend.username}
                        </p>
                        <p className="text-3xl font-dongle text-[var(--color-muted)] opacity-90">
                          {friend.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">

                        <div className="flex items-center gap-2">

                          <img src={Checkmark} alt="Checkmark" className="w-10" />
                          
                          <p className="text-3xl font-dongle text-[var(--color-text)] font-semibold">
                            {friend.lifetime_tasks_completed || 0}
                          </p>

                        </div>

                        <div className="flex items-center gap-2">
      
                          <img src={StreakFire} alt="StreakFire" className="w-10"/>

                          <p className="text-3xl font-dongle text-[var(--color-text)]">
                            {friend.streak_days > 0 ? `${friend.streak_days}` : '0'}
                          </p>

                        </div>
                        <div className="flex items-center gap-2">
                          <img src={achievements} alt="trophies" className="w-10"/>
                          <p className="text-3xl font-dongle text-[var(--color-text)] font-semibold">
                            {friendBadgeCounts[friend.friend_uid] || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-4xl font-dongle text-[var(--color-text)] text-center py-8">
                No friends yet
              </div>
            )}
          </div>
        </div>

        {/* Add New Friend button at the bottom */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="mt-4 px-2 pt-1 w-130 h-17 bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)] font-bold rounded-2xl cursor-pointer transition shadow-[0_7px_4px_rgba(0,0,0,0.3)] hover:bg-[var(--color-button-primary-hover)] text-4xl font-dongle"
        >
          {showSearch ? "Hide Search" : "+ Add New Friend"}
        </button>
      </div>
    </div>
  );
}




