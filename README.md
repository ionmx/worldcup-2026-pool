# FIFA World Cup 2026 Pool

A betting pool web application for the FIFA World Cup 2026. Built with React, TypeScript, and Firebase.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Firebase (Authentication, Realtime Database, Cloud Functions)
- **Linting:** ESLint with TypeScript-aware rules, React 19 plugins, Tailwind CSS validation

## Project Structure

```
worldcup-2026-pool/
├── web/                    # React frontend application
│   ├── src/
│   │   ├── assets/         # Images and static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── routes/         # Page components
│   │   └── services/       # API and business logic
│   └── ...
├── functions/              # Firebase Cloud Functions
│   └── src/
│       └── index.ts
├── utils/                  # Utility scripts
└── firebase.json           # Firebase configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Environment Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd worldcup-2026-pool
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install web dependencies
cd web && npm install

# Install functions dependencies
cd ../functions && npm install
```

3. Set up environment variables for the web app:

```bash
cd web
cp .env.example .env
```

4. Fill in your Firebase configuration values in `web/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

You can find these values in your [Firebase Console](https://console.firebase.google.com/) under **Project Settings > General > Your apps**.

## Development

### Web Application

```bash
cd web

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Firebase Functions

```bash
cd functions

# Build functions
npm run build

# Run Firebase emulators
firebase emulators:start
```

## Deployment

```bash
# Deploy everything
firebase deploy

# Deploy only hosting (web app)
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## Code Conventions

- **2-space indentation** across all files
- **Named exports** for all components and modules
- **Barrel files** (`index.ts`) for clean imports
- **PascalCase** for component and route file names
- **TypeScript strict mode** enabled

## Contributing

Contributions are welcome! Feel free to open a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.
