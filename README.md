# Cepat Tanggap - Admin Panel

Admin panel for managing Cepat Tanggap application, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- User authentication (Login/Logout)
- Role-based access control (Admin, RT, RW)
- Responsive dashboard
- Modern UI with Tailwind CSS
- Type-safe with TypeScript
- State management with React Query

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API server (if running locally)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME="Cepat Tanggap Admin"
   VITE_APP_VERSION=1.0.0
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Authentication

The admin panel supports three user roles:

1. **Admin** - Full access to all features
2. **RT** - Limited access to RT-specific features
3. **RW** - Limited access to RW-specific features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

## License

MIT
