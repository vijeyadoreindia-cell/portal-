import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { formatDate } from "../utils/driveUtils";
import WebinarPoster from "../components/WebinarPoster";
import "./Webinars.css";

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterModal, setPosterModal] = useState(null);

  useEffect(() => { fetchWebinars(); }, []);

  async function fetchWebinars() {
    try {
      const q = query(collection(db, "webinars"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      setWebinars(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const upcoming = webinars.filter((w) => !w.completed);

  return (
    <main className="page-main">
      <div className="container">
        <section className="page-hero fade-up">
          <div className="hero-badge">📅 Upcoming Events</div>
          <h1>Webinars & <span className="highlight">Workshops</span></h1>
          <p>Join our live sessions with experts, mentors, and youth empowerment leaders.</p>
        </section>

        {loading ? (
          <div className="webinars-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="webinar-card skeleton-card">
                <div className="skeleton poster-skeleton" />
                <div className="wc-body">
                  <div className="skeleton" style={{ height: 22, width: "70%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 16, width: "50%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 36, width: 120, marginTop: 16 }} />
                </div>
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state fade-up">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>No upcoming webinars scheduled. Stay tuned!</p>
          </div>
        ) : (
          <div className="webinars-list">
            {upcoming.map((w, i) => (
              <WebinarCard key={w.id} webinar={w} index={i} onViewPoster={() => setPosterModal(w)} />
            ))}
          </div>
        )}
      </div>

      {/* Poster Modal — shows large generated poster */}
      {posterModal && (
        <div className="modal-backdrop" onClick={() => setPosterModal(null)}>
          <div className="poster-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPosterModal(null)}>✕</button>
            <h3>{posterModal.title}</h3>
            <div style={{ borderRadius: 12, overflow: "hidden", margin: "0 0 16px" }}>
              <WebinarPoster webinar={posterModal} size="full" />
            </div>
            <div className="poster-modal-actions">
              {posterModal.registrationLink && (
                <a
                  href={posterModal.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-orange"
                >
                  Register Now →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function WebinarCard({ webinar, index, onViewPoster }) {
  const isUpcoming = webinar.date && new Date(webinar.date) >= new Date();

  return (
    <div className="webinar-card fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Generated poster instead of Drive image */}
      <div className="wc-poster" onClick={onViewPoster}>
        <WebinarPoster webinar={webinar} size="card" />
        <div className="poster-hover">View Full Poster</div>
      </div>

      <div className="wc-body">
        <div className="wc-top">
          {isUpcoming && <span className="live-badge">🔔 Upcoming</span>}
          {webinar.tag && <span className="topic-badge">{webinar.tag}</span>}
        </div>
        <h2 className="wc-title">{webinar.title}</h2>
        {webinar.speaker && <p className="wc-speaker">👤 {webinar.speaker}</p>}
        {webinar.description && <p className="wc-desc">{webinar.description}</p>}

        <div className="wc-meta">
          {webinar.date && (
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(webinar.date)}</span>
            </div>
          )}
          {webinar.time && (
            <div className="meta-item">
              <span className="meta-icon">🕐</span>
              <span>{webinar.time}</span>
            </div>
          )}
          {webinar.platform && (
            <div className="meta-item">
              <span className="meta-icon">💻</span>
              <span>{webinar.platform}</span>
            </div>
          )}
        </div>

        <div className="wc-actions">
          <button className="btn btn-ghost btn-sm" onClick={onViewPoster}>View Poster</button>
          {webinar.registrationLink && (
            <a href={webinar.registrationLink} target="_blank" rel="noreferrer" className="btn btn-orange">
              Register Now →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
