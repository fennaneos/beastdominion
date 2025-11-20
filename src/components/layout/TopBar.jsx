// src/components/layout/TopBar.jsx
import "./TopBar.css";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export default function TopBar({ gold, shards, stamina, user }) {
  const avatar = user?.photoURL || "/default-avatar.png";
  const name = user?.displayName || "Unknown Hero";

  return (
    <div className="topbar">
      {/* LEFT SIDE — PROFILE */}
      <div className="topbar-profile">
        <img
          src={avatar}
          alt="profile"
          className="topbar-avatar"
        />

        <div className="topbar-userinfo">
          <div className="topbar-username">{name}</div>

          {user && (
            <button
              className="topbar-logout"
              onClick={() => signOut(auth)}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* CENTER LOGO */}
      <div className="topbar-title">Beast Dominion</div>

      {/* RIGHT RESOURCE COUNTERS */}
      <div className="topbar-resources">
        <div className="resource gold">💰 {gold}</div>
        <div className="resource shards">🔮 {shards}</div>
        <div className="resource stamina">⚡ {stamina}</div>
      </div>
    </div>
  );
}
