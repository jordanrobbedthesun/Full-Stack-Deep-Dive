# Full-Stack AI Chatbot App

## Overview
A cross-platform mobile chat app where users can securely log in, chat with an AI (Google Gemini), and have their chat history saved and loaded per user. Built with React Native, Supabase, and Node.js/Express.

---

## Features
- **User Authentication:** Secure sign up and login using Supabase Auth ([setup followed this guide](https://supabase.com/docs/guides/auth/quickstarts/react-native)).
- **AI Chatbot:** Chat with Google Gemini via a secure backend.
- **Chat History:** All messages are saved and loaded per user from Supabase.
- **Sign Out:** Users can log out and return to the login screen.

---

## Technologies Used

### Frontend
- **React Native:** Mobile UI framework for iOS/Android.
- **Supabase JS Client:** Handles authentication and chat history.
- **@rneui/themed:** For styled input and button components.

### Backend
- **Node.js + Express:** Handles AI chat endpoint and keeps Gemini API key secret.
- **@google/generative-ai:** Connects to Google Gemini API.
- **dotenv:** Loads environment variables (API keys, etc.).
- **CORS:** Allows mobile app to call backend from different origins.

### Database & Auth
- **Supabase:**
	- **Auth:** Secure email/password login.
	- **Database:** Postgres table (`chats`) for storing chat history per user.

---

## How It Works

### User Flow
1. User opens the app and logs in (or signs up).
2. The app loads their previous chat messages from Supabase.
3. User types a message and hits send.
4. The message is saved to Supabase and also sent to the backend.
5. The backend asks Gemini for a reply.
6. The reply is sent back to the app, shown to the user, and saved to Supabase.
7. User can sign out, which returns them to the login screen.

### Architecture Diagram
```
[User]
	│
	▼
[React Native App]
	│         │
	│         └──(login, save/load chat)──► [Supabase]
	│
	└──(send message)──► [Node/Express Backend] ──► [Gemini AI]
													│
													└──(returns reply)───┘
```

---

## Project Structure

```
frontend/
	components/
		Auth.tsx         # Login/signup UI
		ChatBox.tsx      # Chat UI, loads/saves messages
	lib/
		supabase.ts      # Supabase client config
	App.tsx            # App entry, session logic
backend/
	server.js          # Express server, Gemini endpoint
	.env               # Gemini API key (not committed)
```

---

## Setup & Running

### 1. Supabase
- Create a project at [supabase.com](https://supabase.com/).
- Set up Auth (email/password) following [this guide](https://supabase.com/docs/guides/auth/quickstarts/react-native).
- Create a `chats` table:
	```sql
	create table chats (
		id uuid default uuid_generate_v4() primary key,
		user_id uuid references auth.users(id),
		text text not null,
		sender text check (sender in ('user', 'bot')) not null,
		created_at timestamp with time zone default timezone('utc', now())
	);
	```
- Enable Row Level Security (RLS) for the `chats` table.

#### Online User Counter (Public)

- Create an `online_users` table:
	```sql
	create table online_users (
		user_id uuid primary key references auth.users(id) on delete cascade,
		last_seen timestamp with time zone not null default timezone('utc', now())
	);
	-- Enable Row Level Security
	alter table online_users enable row level security;
	-- Policy: Users can insert/update/delete their own row
	create policy "Users can manage their own online status"
		on online_users
		for all
		using (auth.uid() = user_id);
	-- Policy: Allow all users to select (read) online_users
	create policy "Allow all users to read online users"
		on online_users
		for select
		using (true);
	```
	This allows the app to show a public count of users online in real time.
# FAQ (Beginner Friendly)

**Q: Why does the app use Supabase directly from the frontend?**
A: Supabase is designed to be used from the client (like Firebase). It’s secure because of Row Level Security (RLS) and only exposes a public key. The backend is only needed for things that require secrets (like the Gemini API key).

**Q: Why do I need a backend at all?**
A: The backend is only for the AI chat endpoint. It keeps your Gemini API key secret and talks to Gemini for you. All other data (auth, chat history, online users) is handled by Supabase directly from the app.

**Q: Why does the online user counter only show 1 user?**
A: By default, Supabase RLS only lets users see their own rows. You must add a policy to allow all users to SELECT from `online_users` (see above) so everyone can see the count.

**Q: How do I test on a real device?**
A: Use your computer’s LAN IP address (not localhost) for the backend URL in `ChatBox.tsx`. Make sure your phone and computer are on the same Wi-Fi network.

**Q: Where do I put my Gemini API key?**
A: In the backend’s `.env` file. Never put it in the frontend or commit it to git.

**Q: How do I clear chat history?**
A: You can add a button in the app to delete rows from the `chats` table for the current user, or clear the table in Supabase directly.

**Q: Can I use this with Expo?**
A: Yes! This project works with Expo or plain React Native CLI.

**Q: Is this secure?**
A: Yes, as long as you use RLS in Supabase and never expose your service role or Gemini API keys in the frontend.

### 2. Backend
- In `backend/`, copy `.env.example` to `.env` and add your Gemini API key.
- Install dependencies:
	```sh
	npm install
	npm start
	```
- Make sure backend is accessible to your device (use your computer's LAN IP if testing on a real device).

### 3. Frontend
- In `frontend/`, install dependencies:
	```sh
	npm install
	npm start
	```
- Update the backend URL in `ChatBox.tsx` to match your backend's IP and port if needed.
- Run on emulator or device (Expo or React Native CLI).

---

## Security & Best Practices
- **Frontend** only uses Supabase's public (anon) key and never stores secrets.
- **Backend** keeps Gemini API key secret and is only used for AI chat.
- **Supabase** handles all authentication and chat storage securely with RLS.

---

## Detailed Summary

- **Frontend:** Handles all user interaction, login, and chat display. Talks directly to Supabase for auth and chat history. Sends chat prompts to backend for AI replies.
- **Backend:** Only used for AI chat, keeps Gemini API key secret, and returns AI replies to the app.
- **Supabase:** Handles all user accounts and chat storage, securely and easily. Users can only access their own data.

This setup is modern, secure, and scalable—used by many real-world apps!

---

## Credits
- Supabase Auth setup based on [Supabase React Native Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- Gemini API by Google
- React Native, Express, and open source community

---

## License
MIT
# Full-Stack-Deep-Dive