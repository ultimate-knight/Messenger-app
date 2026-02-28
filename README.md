
# Chatify Messenger App

A modern, real-time chat application built with Next.js, Convex, Clerk authentication, and Lucide React icons. This project demonstrates a scalable, full-stack messaging platform with user authentication, online status, unread message badges, and more.

## Features

- **User Authentication**: Secure sign-in and sign-up with Clerk.
- **Real-Time Messaging**: Powered by Convex for instant message delivery and updates.
- **Online Status & Last Seen**: Track user presence and last activity.
- **Unread Message Badges**: Visual indicators for unread messages.
- **Modern UI**: Built with Next.js, React, and Lucide icons for a clean, responsive interface.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [Convex](https://convex.dev/) (Backend as a Service)
- [Clerk](https://clerk.com/) (Authentication)
- [Lucide React](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Yarn or npm
- Convex account & project
- Clerk account & project

### Installation

1. **Clone the repository:**
	```bash
	git clone https://github.com/ultimate-knight/Messenger-app.git
	cd Messenger-app
	```
2. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```
3. **Set up environment variables:**
	- Create a `.env.local` file in the root directory.
	- Add the following variables:
	  ```env
	  NEXT_PUBLIC_CONVEX_URL=your_convex_url
	  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
	  CLERK_SECRET_KEY=your_clerk_secret_key
	  ```
4. **Run Convex dev server:**
	```bash
	npx convex dev
	```
5. **Start the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	```

6. **Open the app:**
	Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` — Main Next.js app directory
- `src/components/` — Reusable UI components (OnlineDot, UnreadBadge, etc.)
- `convex/` — Convex backend functions (messages, users, online status, etc.)
- `utils/` — Utility functions (e.g., formatTime)
- `public/` — Static assets

## Scripts

- `dev` — Start the Next.js development server
- `build` — Build the app for production
- `start` — Start the production server

## License

This project is licensed under the MIT License.

---

Inspired by modern chat applications. Contributions welcome!
