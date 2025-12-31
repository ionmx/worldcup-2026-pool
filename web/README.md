# World Cup 2026 Pool - Web App

A React + TypeScript + Vite web application for the World Cup 2026 betting pool.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your Firebase configuration values in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

You can find these values in your [Firebase Console](https://console.firebase.google.com/) under Project Settings > General > Your apps.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

---

## Vite Configuration

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Linting

This project uses strict TypeScript-aware ESLint rules:

- `typescript-eslint` with `recommendedTypeChecked` for type-aware linting
- `eslint-plugin-react-x` and `eslint-plugin-react-dom` for React 19-specific rules
- `@poupe/eslint-plugin-tailwindcss` for Tailwind CSS class validation

Run linting with:

```bash
npm run lint
```
