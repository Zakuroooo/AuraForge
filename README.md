# AuraForge Studio

> AI-powered generative art studio. Describe your vision — AuraForge conjures it.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary)
![Hugging Face](https://img.shields.io/badge/HuggingFace-SDXL-FFD21E?style=flat-square&logo=huggingface)

---

## What is AuraForge?

AuraForge is a full-stack AI image generation studio where users can:
- Generate stunning AI artwork using Stable Diffusion XL
- Build a personal gallery of generated visions
- Customize their creator profile with avatar upload and crop
- Access their entire creation history in The Vault

---

## Features

### Core
- AI Image Generation via Hugging Face Inference API (SDXL)
- Prompt Enhancement powered by AI
- Style presets: Cyberpunk, Anime/Studio, Watercolor, Dark Fantasy, Realistic
- Real-time generation progress with stage labels
- Personal Art Gallery with lightbox viewer
- Delete generated images with confirmation modal

### Auth System
- JWT-based authentication (access + refresh tokens)
- Email + username login support
- Password reset via email (Gmail SMTP)
- bcrypt password hashing (cost factor 12)
- Auth guards — protected routes redirect automatically

### Profile
- Avatar upload with circular crop editor (react-easy-crop)
- Cloudinary cloud storage for avatars
- Creator stats: total generated, join date, plan type
- The Vault — personal gallery of all saved works

### UI/UX
- Fully responsive — mobile, tablet, desktop
- Cyber/mono aesthetic with aurora background animations
- Fluid cursor effect on desktop
- Hamburger menu on mobile
- Toast notifications with cyber styling

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Frontend framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| react-easy-crop | Avatar crop editor |
| Axios | HTTP client |
| js-cookie | Cookie management |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Backend framework |
| Python 3.11 | Language |
| MongoDB Atlas | Database |
| PyMongo / Motor | MongoDB driver |
| bcrypt | Password hashing |
| JWT (PyJWT) | Authentication tokens |
| fastapi-mail | Email service |
| Cloudinary | Avatar image storage |
| Hugging Face API | AI image generation |

---

## Project Structure

```
AuraForgePro/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── gallery/page.tsx      # AI Studio / Gallery
│   │   ├── profile/page.tsx      # Creator profile
│   │   ├── auth/                 # Login, Register, Reset
│   │   ├── privacy/              # Legal pages
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AuroraBackground.tsx
│   │   ├── BackgroundBeams.tsx
│   │   └── FluidCursor.tsx
│   └── middleware.ts             # Auth route guards
├── backend/
│   ├── main.py                   # FastAPI app entry
│   ├── models.py                 # Pydantic models
│   ├── database.py               # MongoDB connection
│   ├── security.py               # JWT + bcrypt
│   └── routers/
│       ├── auth.py               # Login, Register
│       ├── auth_recovery.py      # Password reset
│       ├── gallery.py            # Image generation
│       └── users.py              # Profile, Avatar
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Hugging Face account (free)
- Cloudinary account (free)
- Gmail account with App Password

### 1. Clone the repository
```bash
git clone https://github.com/Zakuroooo/AuraForge.git
cd AuraForge
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
# Database
MONGODB_URI=your_mongodb_atlas_uri

# Auth
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Hugging Face
HUGGINGFACE_API_TOKEN=your_hf_token
HUGGINGFACE_MODEL_URL=https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# URLs
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3000
```

Start backend:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## Environment Variables Summary

| Variable | Where | Required |
|---|---|---|
| MONGODB_URI | backend/.env | ✅ |
| SECRET_KEY | backend/.env | ✅ |
| HUGGINGFACE_API_TOKEN | backend/.env | ✅ |
| CLOUDINARY_CLOUD_NAME | backend/.env | ✅ |
| CLOUDINARY_API_KEY | backend/.env | ✅ |
| CLOUDINARY_API_SECRET | backend/.env | ✅ |
| MAIL_USERNAME | backend/.env | ✅ |
| MAIL_PASSWORD | backend/.env | ✅ |
| NEXT_PUBLIC_API_URL | frontend/.env.local | ✅ |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Create account |
| POST | /auth/login | Login |
| POST | /auth/forgot-password | Send reset email |
| POST | /auth/reset-password-confirm | Reset password |

### Gallery
| Method | Endpoint | Description |
|---|---|---|
| GET | /gallery/ | Get user images |
| POST | /gallery/generate | Generate new image |
| DELETE | /gallery/{id} | Delete image |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | /users/me | Get profile |
| POST | /users/me/avatar | Upload avatar |
| DELETE | /users/me/avatar | Remove avatar |

---

## Deployment

### Frontend → Vercel
```bash
npm install -g vercel
vercel
```

### Backend → Railway
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set all environment variables in Railway dashboard
4. Deploy

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## License

MIT License — feel free to use, modify and distribute.

---

## Author

Built with ❤️ by Pranay Sarkar
GitHub: [@Zakuroooo](https://github.com/Zakuroooo)

---

*AuraForge — Where prompts become visions.*
