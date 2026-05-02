import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "../firebase/config";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, setDoc, getDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WebinarPoster from "../components/WebinarPoster";
import "./Admin.css";

const TABS = ["Podcasts", "Webinars", "Glimpses", "Admins"];

export default function Admin() {
  const { isAdmin, user, SUPER_ADMIN } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Podcasts");

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header fade-up">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage all content on the ADORE portal</p>
          </div>
          <span className="admin-user-badge">👤 {user?.displayName}</span>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            (t === "Admins" && user?.email !== SUPER_ADMIN) ? null :
            <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "Podcasts" && "🎙"} {t === "Webinars" && "📅"} {t === "Glimpses" && "🎬"} {t === "Admins" && "👥"} {t}
            </button>
          ))}
        </div>

        <div className="admin-content fade-in">
          {activeTab === "Podcasts" && <PodcastsAdmin />}
          {activeTab === "Webinars" && <WebinarsAdmin />}
          {activeTab === "Glimpses" && <GlimpsesAdmin />}
          {activeTab === "Admins" && user?.email === SUPER_ADMIN && <AdminsAdmin />}
        </div>
      </div>
    </main>
  );
}

/* ─── IMAGE UPLOAD HELPER ───────────────────────────────────────── */
function ImageUploader({ value, onChange, folder = "thumbnails" }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploading(true);
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on("state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { toast.error("Upload failed: " + err.message); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onChange(url);
        setUploading(false);
        setProgress(0);
        toast.success("Image uploaded!");
      }
    );
  }

  return (
    <div className="image-uploader">
      {value && (
        <div className="upload-preview">
          <img src={value} alt="Thumbnail preview" />
          <button type="button" className="remove-img-btn" onClick={() => onChange("")}>✕ Remove</button>
        </div>
      )}
      <div className="upload-area" onClick={() => fileRef.current?.click()}>
        {uploading ? (
          <div className="upload-progress">
            <div className="upload-bar" style={{ width: `${progress}%` }} />
            <span>Uploading {progress}%...</span>
          </div>
        ) : (
          <>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{value ? "Replace image" : "Click to upload image"}</span>
            <small>JPG, PNG, WebP · max 5MB</small>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

/* ─── PODCASTS CRUD ─────────────────────────────────────────── */
function PodcastsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const q = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  const handleEdit = (item) => { setEditing(item); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditing(null); };

  async function handleDelete(id) {
    if (!window.confirm("Delete this podcast?")) return;
    await deleteDoc(doc(db, "podcasts", id));
    toast.success("Podcast deleted");
    fetchItems();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "podcasts", editing.id), data);
      toast.success("Podcast updated!");
    } else {
      await addDoc(collection(db, "podcasts"), { ...data, createdAt: serverTimestamp() });
      toast.success("Podcast added!");
    }
    handleClose(); fetchItems();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Podcasts <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Podcast</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Thumb</th><th>Title</th><th>Guest</th><th>Date</th><th>EP</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={6} className="empty-row">No podcasts yet</td></tr>}
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.thumbnailUrl
                      ? <img src={p.thumbnailUrl} alt="" style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 4 }} />
                      : <span style={{ fontSize: 20 }}>🎙</span>}
                  </td>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.guestName || "—"}</td>
                  <td>{p.date || "—"}</td>
                  <td>{p.episodeNumber ? `EP ${p.episodeNumber}` : "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <PodcastForm initial={editing} onSave={handleSave} onClose={handleClose} />}
    </section>
  );
}

function PodcastForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    guestName: initial?.guestName || "",
    description: initial?.description || "",
    videoUrl: initial?.videoUrl || "",
    thumbnailUrl: initial?.thumbnailUrl || "",
    episodeNumber: initial?.episodeNumber || "",
    date: initial?.date || "",
    duration: initial?.duration || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) { toast.error("Title and Video URL are required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Podcast" : "Add New Podcast"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="Podcast title" /></div>
          <div className="form-group"><label>Guest Name</label><input value={form.guestName} onChange={set("guestName")} placeholder="e.g. Dr. Jane Doe" /></div>
          <div className="form-group">
            <label>Google Drive Video URL *</label>
            <input value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Paste the Google Drive share link of the video</p>
          </div>

          {/* ── THUMBNAIL: upload image directly ── */}
          <div className="form-group">
            <label>Thumbnail Image</label>
            <ImageUploader
              value={form.thumbnailUrl}
              onChange={(url) => setForm((f) => ({ ...f, thumbnailUrl: url }))}
              folder="podcast-thumbnails"
            />
            <p className="form-hint">Upload a cover image for this podcast (recommended: 16:9, under 5MB)</p>
          </div>

          <div className="form-row">
            <div className="form-group"><label>Episode No.</label><input value={form.episodeNumber} onChange={set("episodeNumber")} placeholder="e.g. 1" type="number" /></div>
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Duration</label><input value={form.duration} onChange={set("duration")} placeholder="e.g. 45 min" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="Brief description..." /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Podcast"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── WEBINARS CRUD ─────────────────────────────────────────── */
function WebinarsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const q = query(collection(db, "webinars"), orderBy("date", "asc"));
    const snap = await getDocs(q).catch(() => ({ docs: [] }));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this webinar?")) return;
    await deleteDoc(doc(db, "webinars", id));
    toast.success("Webinar deleted");
    fetchItems();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "webinars", editing.id), data);
      toast.success("Webinar updated!");
    } else {
      await addDoc(collection(db, "webinars"), { ...data, createdAt: serverTimestamp() });
      toast.success("Webinar added!");
    }
    setShowForm(false); setEditing(null); fetchItems();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Upcoming Webinars <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Webinar</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Poster</th><th>Title</th><th>Speaker</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={6} className="empty-row">No webinars yet</td></tr>}
              {items.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div style={{ width: 56, height: 36, borderRadius: 4, overflow: "hidden" }}>
                      <WebinarPoster webinar={w} size="card" />
                    </div>
                  </td>
                  <td><strong>{w.title}</strong></td>
                  <td>{w.speaker || "—"}</td>
                  <td>{w.date || "—"}</td>
                  <td>{w.time || "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(w); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(w.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <WebinarForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </section>
  );
}

function WebinarForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    speaker: initial?.speaker || "",
    description: initial?.description || "",
    date: initial?.date || "",
    time: initial?.time || "",
    platform: initial?.platform || "",
    tag: initial?.tag || "",
    registrationLink: initial?.registrationLink || "",
    completed: initial?.completed || false,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Webinar" : "Add New Webinar"}</h2>

        {/* Live poster preview */}
        <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 20, height: 140 }}>
          <WebinarPoster webinar={form} size="full" />
        </div>
        <p className="form-hint" style={{ marginBottom: 16, textAlign: "center" }}>
          ✨ Poster auto-generates from the details below — no upload needed
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="Webinar title" /></div>
          <div className="form-group"><label>Speaker / Host</label><input value={form.speaker} onChange={set("speaker")} placeholder="Speaker name" /></div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Time</label><input value={form.time} onChange={set("time")} placeholder="e.g. 6:00 PM IST" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Platform</label><input value={form.platform} onChange={set("platform")} placeholder="e.g. Zoom, Google Meet" /></div>
            <div className="form-group">
              <label>Topic Tag</label>
              <select value={form.tag} onChange={set("tag")}>
                <option value="">Select a topic...</option>
                <option value="Leadership">Leadership</option>
                <option value="Career">Career</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Technology">Technology</option>
                <option value="Motivation">Motivation</option>
              </select>
              <p className="form-hint">Tag changes the poster accent color</p>
            </div>
          </div>
          <div className="form-group">
            <label>Registration Link</label>
            <input value={form.registrationLink} onChange={set("registrationLink")} placeholder="https://forms.gle/..." />
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="What will participants learn?" /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Webinar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── GLIMPSES CRUD ─────────────────────────────────────────── */
function GlimpsesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const q = query(collection(db, "glimpses"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q).catch(() => ({ docs: [] }));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this glimpse?")) return;
    await deleteDoc(doc(db, "glimpses", id));
    toast.success("Glimpse deleted");
    fetchItems();
  }

  async function handleSave(data) {
    if (editing) {
      await updateDoc(doc(db, "glimpses", editing.id), data);
      toast.success("Glimpse updated!");
    } else {
      await addDoc(collection(db, "glimpses"), { ...data, createdAt: serverTimestamp() });
      toast.success("Glimpse added!");
    }
    setShowForm(false); setEditing(null); fetchItems();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Webinar Glimpses <span className="count-badge">{items.length}</span></h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Glimpse</button>
      </div>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Speaker</th><th>Tag</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className="empty-row">No glimpses yet</td></tr>}
              {items.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.title}</strong></td>
                  <td>{g.speaker || "—"}</td>
                  <td>{g.tag || "—"}</td>
                  <td>{g.date || "—"}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(g); setShowForm(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <GlimpseForm initial={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </section>
  );
}

function GlimpseForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    speaker: initial?.speaker || "",
    description: initial?.description || "",
    videoUrl: initial?.videoUrl || "",
    thumbnailUrl: initial?.thumbnailUrl || "",
    date: initial?.date || "",
    tag: initial?.tag || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) { toast.error("Title and Video URL are required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{initial ? "Edit Glimpse" : "Add Webinar Glimpse"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set("title")} placeholder="Webinar title" /></div>
          <div className="form-group"><label>Speaker</label><input value={form.speaker} onChange={set("speaker")} placeholder="Speaker name" /></div>
          <div className="form-group">
            <label>Google Drive Video URL *</label>
            <input value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://drive.google.com/file/d/..." />
            <p className="form-hint">Paste the Google Drive share link of the recording</p>
          </div>
          <div className="form-group">
            <label>Thumbnail Image</label>
            <ImageUploader
              value={form.thumbnailUrl}
              onChange={(url) => setForm((f) => ({ ...f, thumbnailUrl: url }))}
              folder="glimpse-thumbnails"
            />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input value={form.date} onChange={set("date")} type="date" /></div>
            <div className="form-group"><label>Tag</label><input value={form.tag} onChange={set("tag")} placeholder="e.g. Workshop" /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} placeholder="Brief description..." /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Update" : "Add Glimpse"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── ADMINS MANAGEMENT (Super Admin only) ──────────────────── */
function AdminsAdmin() {
  const { user, SUPER_ADMIN } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function addAdmin(e) {
    e.preventDefault();
    if (!newEmail) { toast.error("Email is required"); return; }
    const existing = await getDoc(doc(db, "admins", newEmail));
    if (existing.exists()) { toast.warning("Already an admin"); return; }
    await setDoc(doc(db, "admins", newEmail), {
      email: newEmail,
      name: newName || newEmail,
      addedBy: user.email,
      addedAt: new Date().toISOString(),
      isSuperAdmin: false,
    });
    toast.success(`${newEmail} is now an admin`);
    setNewEmail(""); setNewName("");
    fetchAdmins();
  }

  async function removeAdmin(email) {
    if (email === SUPER_ADMIN) { toast.error("Cannot remove the super admin"); return; }
    if (!window.confirm(`Remove ${email} as admin?`)) return;
    await deleteDoc(doc(db, "admins", email));
    toast.success("Admin removed");
    fetchAdmins();
  }

  return (
    <section>
      <div className="section-header">
        <h2>Manage Admins <span className="count-badge">{admins.length}</span></h2>
      </div>
      <form className="add-admin-form" onSubmit={addAdmin}>
        <h3>Add New Admin</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Admin name" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@example.com" type="email" />
          </div>
          <div className="form-group" style={{ alignSelf: "flex-end" }}>
            <button type="submit" className="btn btn-primary btn-full">Add Admin</button>
          </div>
        </div>
        <p className="form-hint">The person must sign in with this Google account to access admin features.</p>
      </form>
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Added</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.name || "—"}</td>
                  <td>{a.email}</td>
                  <td>{a.addedAt ? new Date(a.addedAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    {a.isSuperAdmin
                      ? <span className="badge-super">Super Admin</span>
                      : <span className="badge-admin-sm">Admin</span>}
                  </td>
                  <td className="action-cell">
                    {!a.isSuperAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeAdmin(a.email)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
