# 🗺️ Delhi Startup Map

The definitive interactive map and directory of the Delhi NCR startup ecosystem. Discover startups, VCs, angel networks, and open job roles across Delhi, Gurugram, Noida, and Ghaziabad.

## ✨ Features

- **Interactive Geospatial Map**: Explore 500+ startups and VCs with Mapbox clustering and precise/area-level pins.
- **Grid View**: A beautiful, responsive card layout for browsing startups like a traditional directory.
- **Smart Filtering**: Search by name, tags (e.g., "Shark Tank", "Y Combinator"), city, or entity type.
- **SEO-Optimized Profiles**: Dedicated `/startup/[slug]` pages for every company with rich metadata.
- **Admin Dashboard**: A moderation queue to approve or reject user-submitted startups.
- **Automated Data Pipelines**: Scripts to ingest new startups from funding news and sync live job postings from ATS platforms.
- **Modern UI/UX**: Dark/Light mode with smooth transitions, a custom preloader, and a sleek, minimalist design.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + PostGIS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Map Engine**: [Mapbox GL JS](https://www.mapbox.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account
- A [Mapbox](https://www.mapbox.com/) account (for the API token)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/delhi-startup-map.git
cd delhi-startup-map
npm install
```
