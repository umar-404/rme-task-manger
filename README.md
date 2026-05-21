# Task Manager - Effective Risk Management

A full-stack Task Management Web Application with user authentication, built using React (frontend), Node.js/Express (backend), and MongoDB (database).

## Features

### Core Features
- **User Authentication**: Register, login, logout with JWT tokens
- **Task Management**: Create, read, update, delete tasks
- **Task Status**: Mark tasks as pending/completed
- **Priority Levels**: Low, Medium, High priority with color-coded badges
- **Search & Filter**: Search tasks by title/description, filter by status (All/Pending/Completed)

### Security
- **JWT Authentication**: Token-based auth with httpOnly cookies + Authorization header fallback
- **Token Blacklisting**: Logged-out tokens are invalidated
- **Password Hashing**: bcryptjs for secure password storage

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript, ts-node |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT with cookie-parser |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers (auth, tasks)
│   │   ├── middleware/      # Auth verification middleware
│   │   ├── models/          # Mongoose schemas (User, Task, BlacklistedToken)
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Token blacklist service
│   │   └── app.ts           # Express app entry point
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # TaskForm, TaskItem
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── services/        # API service layer
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Tailwind imports
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.xxxxx.mongodb.net/task_manager_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_random_jwt_secret_key_2026
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | `{ username, email, password }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` |
| POST | `/api/auth/logout` | Logout user (blacklists token) | - |
| GET | `/api/auth/me` | Get current user | - |

**Login Response:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "username": "...", "email": "..." },
  "token": "eyJhbGci..."
}
```

### Tasks

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all tasks (user's tasks only) | - |
| POST | `/api/tasks` | Create new task | `{ title, description, priority }` |
| PUT | `/api/tasks/:id` | Update task status | `{ status: "pending" | "completed" }` |
| DELETE | `/api/tasks/:id` | Delete task | - |

**Task Response:**
```json
{
  "_id": "...",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "High",
  "userId": "...",
  "createdAt": "2026-05-21T...",
  "updatedAt": "2026-05-21T..."
}
```

## Frontend Pages

### Login/Register Page
- Toggle between login and register forms
- Error handling for invalid credentials
- "User not found" message with register prompt

### Dashboard (Authenticated)
- **Left Panel**: Task creation form
- **Right Panel**: Task list with search and filter
- **Header**: Username display and sign out button

### Task Features
- Color-coded priority badges (Red=High, Yellow=Medium, Green=Low)
- Strike-through text for completed tasks
- "Complete" / "Undo" toggle button
- Delete button with browser confirmation

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username |
| email | String | Unique email |
| password | String | Hashed password (bcrypt) |
| createdAt | Date | Timestamp |
| updatedAt | Date | Timestamp |

### Task
| Field | Type | Description |
|-------|------|-------------|
| title | String | Task title (required) |
| description | String | Task description |
| status | String | "pending" or "completed" |
| priority | String | "Low", "Medium", or "High" |
| userId | ObjectId | Reference to User |
| createdAt | Date | Timestamp |
| updatedAt | Date | Timestamp |

### BlacklistedToken
| Field | Type | Description |
|-------|------|-------------|
| token | String | The blacklisted JWT |
| expiresAt | Date | Auto-delete when token expires |

## Assumptions & Notes

1. **Database**: Using MongoDB Atlas (cloud) - easier setup than local MongoDB
2. **Authentication**: Token sent via both httpOnly cookie and Authorization header for flexibility
3. **Token Expiry**: JWT tokens expire after 7 days
4. **User Isolation**: Users can only see and manage their own tasks
5. **Error Handling**: Basic error responses; production would need more detailed logging

## Improvements for Production

- [ ] Input validation (express-validator)
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS in production
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Pagination for task list
- [ ] Drag-and-drop task reordering
- [ ] Due dates for tasks
- [ ] Task categories/tags
- [ ] Unit and integration tests

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| NODE_ENV | "production" or "development" |