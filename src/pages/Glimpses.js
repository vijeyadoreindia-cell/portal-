import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDriveEmbedUrl, getDriveThumbnailUrl, formatDate } from "../utils/driveUtils";
import "./Glimpses.css";

export default function Glimpses() {
  const [glimpses, setGlimpses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchGlimpses();
  }, []);

  async function fetchGlimpses() {
    try {
      const q = query(collection(db, "glimpses"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setGlimpses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const openVideo = (g) => setSelected(g);

  return (
    <main className="page-main">
      <div className="container">
        <section className="page-hero fade-up">
          <div className="hero-badge">🎬 Webinar Glimpses</div>
          <h1>Relive the <span className="highlight">Moments</span></h1>
          <p>Highlights and recordings from our past webinars, workshops, and special events.</p>
        </section>

        {loading ? (
          <div className="glimpses-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glimpse-card skeleton-card">
                <div className="skeleton thumb-skeleton" />
                <div className="skeleton" style={{ height: 18, margin: "14px 14px 8px" }} />
                <div className="skeleton" style={{ height: 14, margin: "0 14px 14px", width: "60%" }} />
              </div>
            ))}
          </div>
        ) : glimpses.length === 0 ? (
          <div className="empty-state fade-up">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.724v6.552a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p>No glimpses yet. Past webinar recordings will appear here.</p>
          </div>
        ) : (
          <div className="glimpses-grid">
            {glimpses.map((g, i) => (
              <GlimpseCard key={g.id} glimpse={g} index={i} onPlay={() => openVideo(g)} />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div>
                <h3>{selected.title}</h3>
                {selected.date && <p className="guest-label">📅 {formatDate(selected.date)}</p>}
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="video-wrapper">
              <iframe
                src={getDriveEmbedUrl(selected.videoUrl)}
                title={selected.title}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            {selected.description && <p className="video-desc">{selected.description}</p>}
          </div>
        </div>
      )}
    </main>
  );
}

function GlimpseCard({ glimpse, index, onPlay }) {
  const thumb = glimpse.thumbnailUrl || getDriveThumbnailUrl(glimpse.videoUrl);

  return (
    <div className="glimpse-card fade-up" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="card-thumb glimpse-thumb" onClick={onPlay}>
        {thumb ? (
          <img src={thumb} alt={glimpse.title} onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="thumb-placeholder glimpse-placeholder">
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.724v6.552a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/></svg>
          </div>
        )}
        <div className="play-overlay">
          <div className="play-btn-big">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        {glimpse.tag && <span className="ep-badge">{glimpse.tag}</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">{glimpse.title}</h3>
        {glimpse.speaker && <p className="card-guest">👤 {glimpse.speaker}</p>}
        {glimpse.description && <p className="card-desc">{glimpse.description}</p>}
        <div className="card-footer">
          {glimpse.date && <span className="card-date">📅 {formatDate(glimpse.date)}</span>}
        </div>
        <button className="btn btn-primary btn-sm watch-btn" onClick={onPlay}>▶ Watch</button>
      </div>
    </div>
  );
}
