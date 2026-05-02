import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { getDriveEmbedUrl, getDriveThumbnailUrl, formatDate } from "../utils/driveUtils";
import "./Podcasts.css";

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { user, loginWithGoogle } = useAuth();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  async function fetchPodcasts() {
    try {
      const q = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPodcasts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const openVideo = (podcast) => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    setSelected(podcast);
  };

  return (
    <main className="page-main">
      <div className="container">
        {/* Hero */}
        <section className="page-hero fade-up">
          <div className="hero-badge">🎙 ADORE Podcasts</div>
          <h1>Listen. Learn. <span className="highlight">Lead.</span></h1>
          <p>Inspiring conversations with changemakers, educators, and youth leaders from around the world.</p>
          {!user && (
            <div className="login-nudge">
              <span>🔒 Sign in to watch full episodes</span>
              <button className="btn btn-orange btn-sm" onClick={loginWithGoogle}>Sign in with Google</button>
            </div>
          )}
        </section>

        {/* Grid */}
        {loading ? (
          <div className="podcasts-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="podcast-card skeleton-card">
                <div className="skeleton thumb-skeleton" />
                <div className="skeleton title-skeleton" />
                <div className="skeleton desc-skeleton" />
              </div>
            ))}
          </div>
        ) : podcasts.length === 0 ? (
          <div className="empty-state fade-up">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M10 8l6 4-6 4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <p>No podcasts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="podcasts-grid">
            {podcasts.map((p, i) => (
              <PodcastCard key={p.id} podcast={p} index={i} onPlay={() => openVideo(p)} isLoggedIn={!!user} />
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
                {selected.guestName && <p className="guest-label">with {selected.guestName}</p>}
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

function PodcastCard({ podcast, index, onPlay, isLoggedIn }) {
  const thumb = podcast.thumbnailUrl || getDriveThumbnailUrl(podcast.videoUrl);
  return (
    <div className="podcast-card fade-up" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="card-thumb" onClick={onPlay}>
        {thumb ? (
          <img src={thumb} alt={podcast.title} onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="thumb-placeholder">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.5"/><path d="M10 8l6 4-6 4V8z" fill="white" opacity="0.7"/></svg>
          </div>
        )}
        <div className="play-overlay">
          <div className={`play-btn-big ${!isLoggedIn ? "locked" : ""}`}>
            {isLoggedIn ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM12 17a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/></svg>
            )}
          </div>
        </div>
        {podcast.episodeNumber && <span className="ep-badge">EP {podcast.episodeNumber}</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">{podcast.title}</h3>
        {podcast.guestName && <p className="card-guest">🎤 {podcast.guestName}</p>}
        {podcast.description && <p className="card-desc">{podcast.description}</p>}
        <div className="card-footer">
          {podcast.date && <span className="card-date">📅 {formatDate(podcast.date)}</span>}
          {podcast.duration && <span className="card-duration">⏱ {podcast.duration}</span>}
        </div>
        <button className="btn btn-primary btn-sm watch-btn" onClick={onPlay}>
          {isLoggedIn ? "▶ Watch Now" : "🔒 Sign in to Watch"}
        </button>
      </div>
    </div>
  );
}
