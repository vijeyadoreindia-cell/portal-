import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="ADORE" className="footer-logo-adore" />
          <div className="footer-divider" />
          <img src="/score.png" alt="SCORE" className="footer-logo-score" />
          <p>Motivating youth for positive action</p>
        </div>
        <div className="footer-copy">
          <p>© {new Date().getFullYear()} ADORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
