# ADORE Portal – Setup Guide

## Prerequisites
- Node.js 16+ installed
- A Google account (vjysupermacy@gmail.com for admin)
- Firebase project already created (portaladore-74237)

---

## Step 1: Add the ADORE Logo

Place your **ADORE.png** logo file into the `public/` folder and rename it to `logo.png`.

```
adore-portal/
  public/
    logo.png   ← put your ADORE.png here
    index.html
```

---

## Step 2: Install Dependencies

Open a terminal in the `adore-portal` folder and run:

```bash
npm install
```

---

## Step 3: Configure Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com) → `portaladore-74237`
2. Click **Authentication** → **Sign-in method**
3. Enable **Google** as a sign-in provider
4. Add your domain to the **Authorized domains** list (e.g., localhost, your deployed domain)

---

## Step 4: Set Firestore Security Rules

1. Go to Firebase Console → **Firestore Database**
2. Click the **Rules** tab
3. Copy-paste the contents of `firestore.rules` into the rules editor
4. Click **Publish**

---

## Step 5: Create Firestore Indexes (if needed)

If you get index errors, Firebase will show a link in the browser console to auto-create them. Click those links.

Collections used:
- `podcasts` – ordered by `createdAt` desc
- `webinars` – ordered by `date` asc
- `glimpses` – ordered by `createdAt` desc
- `admins` – keyed by email

---

## Step 6: Run Locally

```bash
npm start
```

Visit: http://localhost:3000

---

## Step 7: Admin Access

1. Open the portal
2. Sign in with Google using `vjysupermacy@gmail.com`
3. You'll automatically see the **⚙ Admin** link in the navbar
4. Go to **Admin → Admins** tab to add other admins

---

## Step 8: Adding Content

### Adding a Podcast:
1. Go to Admin → Podcasts → "+ Add Podcast"
2. Fill in the title, guest name, etc.
3. For **Video URL**: Share the video from Google Drive → Copy link → Paste here
   - Make sure sharing is set to "Anyone with the link can view"
4. Leave **Thumbnail** empty to auto-generate, or paste a Drive image link

### Adding a Webinar:
1. Go to Admin → Webinars → "+ Add Webinar"
2. For **Poster URL**: Upload the poster image to Google Drive → Share → Copy link → Paste
3. Add the **Registration Link** (Google Form, Zoom link, etc.)

### Adding Glimpses:
1. Go to Admin → Glimpses → "+ Add Glimpse"
2. Paste the Google Drive video link of the recorded webinar

---

## Google Drive URL Tips

✅ **Correct format** (share link):
```
https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view?usp=sharing
```

✅ The portal auto-converts this to an embed URL for playback.

⚠️ **Make sure** the file sharing is set to **"Anyone with the link"** in Google Drive, otherwise videos won't play.

---

## Step 9: Deploy to Production

### Option A – Firebase Hosting (Recommended):

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase init hosting  # select the build/ folder, single-page app: yes
firebase deploy
```

### Option B – Netlify/Vercel:
1. Run `npm run build`
2. Upload the `build/` folder to Netlify or Vercel
3. Set the rewrite rule: all paths → `/index.html`

---

## Features Summary

| Feature | Details |
|---------|---------|
| 🎙 Podcasts | Video player with Google Drive embed, thumbnails, guest info |
| 📅 Webinars | Poster viewer, registration links, date/time/platform info |
| 🎬 Glimpses | Recorded webinar playback (login required) |
| 🔐 Auth | Google Sign-In via Firebase |
| 👥 Admin | Full CRUD for all content, admin management |
| 🛡 Security | Firestore rules, super admin protection |

---

## Troubleshooting

**Video not playing?**
→ Make sure Google Drive sharing is "Anyone with the link can view"
→ Some browsers block 3rd-party iframes — try Chrome

**Google Sign-In not working?**
→ Add `localhost` and your domain to Firebase Auth → Authorized Domains

**Permission denied errors?**
→ Deploy the Firestore security rules from `firestore.rules`

**Admin link not visible?**
→ Sign in with `vjysupermacy@gmail.com` and refresh the page
