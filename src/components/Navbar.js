import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Podcasts" },
    { path: "/webinars", label: "Upcoming Webinars" },
    { path: "/glimpses", label: "Webinar Glimpses" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="ADORE" className="navbar-logo" />
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-link ${location.pathname === l.path ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${location.pathname === "/admin" ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              ⚙ Admin
            </Link>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              <div className="user-dropdown">
                <p className="user-name">{user.displayName}</p>
                <p className="user-email">{user.email}</p>
                {isAdmin && <span className="badge-admin">Admin</span>}
                <button className="dropdown-btn" onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm google-btn" onClick={loginWithGoogle}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.5 2.4-2.6 4.1-5.35 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.6 3.9 1.5l2.1-2.1C16.5 3.8 14.4 3 12 3 6.5 3 2 7.5 2 13s4.5 10 10 10c5.5 0 10-4 10-9.5 0-.6-.1-1.3-.15-1.9 0-.5-.1-1-.5-1.4z"/></svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
