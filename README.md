# interface

A modern, performance-focused portfolio and landing page built with Next.js 16, React 19, and Tailwind CSS.

## Quick Start

```bash
pnpm install
pnpm dev
```

## About

This is a portfolio website for **Burley** — showcasing services for building investable MVPs in 5 days. The site features smooth scrolling animations, a dark theme aesthetic, and a comprehensive component library built on Radix UI primitives.

## Tech Stack

- **Framework**: Next.js 16 (canary)
- **React**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion, GSAP, Lenis
- **Analytics**: Vercel Analytics
- **Forms**: React Hook Form + Zod validation

## Features

- 🎨 Modern, dark-themed design with smooth animations
- 📱 Fully responsive layout
- ♿ Accessible components (Radix UI)
- 🚀 Optimized for performance
- 🎭 Smooth scrolling with Lenis
- 📊 Analytics integration
- 🎯 Form validation with Zod
- 🎪 Comprehensive component library

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
interface/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI based)
│   └── [sections]        # Page sections (Hero, FAQ, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add your custom domain in Vercel settings
3. Deploy automatically on every push to `main`

## License

Private project - All rights reserved
