# SafeCampus - Secure University Social Platform

A secure fullstack MERN social media application with authentication, posts, comments, real-time chat, and more.

## Features

- 🔐 **Secure Authentication** - JWT-based with bcrypt password hashing
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💬 **Real-time Chat** - Friend-to-friend messaging
- 💭 **Posts & Comments** - Create, edit, delete posts and comments
- ❤️ **Social Features** - Like posts, add/remove friends
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 🐳 **Docker Ready** - Containerized deployment with Docker Compose

## Tech Stack

- **Frontend:** React, Material-UI (MUI), Redux Toolkit
- **Backend:** Node.js, Express, MongoDB
- **Database:** MongoDB Atlas (cloud)
- **Deployment:** Docker, Docker Compose

## Prerequisites

- Docker & Docker Compose installed
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Node.js 20+ (for local development without Docker)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd secure-uni-social-platform
```

### 2. Set up environment variables

Copy the example environment file and update it with your MongoDB Atlas credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGO_URL` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random string for JWT signing

### 3. Run with Docker

**Production mode:**
```bash
docker-compose up --build -d
```

**Development mode (with hot reload):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 4. Stop the application

```bash
docker-compose down
```

## Development Without Docker

**Server:**
```bash
cd server
npm install
npm start
```

**Client:**
```bash
cd client
npm install
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

Required variables:
- `MONGO_URL` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token generation

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── scenes/      # Page components
│   │   └── state/       # Redux state management
│   ├── Dockerfile       # Production Docker image
│   └── Dockerfile.dev   # Development Docker image
├── server/              # Express backend
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & validation middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── Dockerfile       # Production Docker image
│   └── Dockerfile.dev   # Development Docker image
├── docker-compose.yml       # Production Docker Compose
├── docker-compose.dev.yml   # Development Docker Compose override
└── .env.example            # Environment variables template
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/:id` - Get user by ID
- `GET /users/:id/friends` - Get user's friends
- `PATCH /users/:id/:friendId` - Add/remove friend

### Posts
- `GET /posts` - Get all posts (feed)
- `GET /posts/:userId/posts` - Get user's posts
- `POST /posts` - Create new post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `PATCH /posts/:id/like` - Like/unlike post
- `POST /posts/:id/comment` - Add comment
- `DELETE /posts/:id/comment/:commentId` - Delete comment

### Messages
- `GET /messages` - Get conversations
- `GET /messages/:friendId` - Get messages with friend
- `POST /messages` - Send message

## Security Features

- JWT authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Non-root Docker containers
- Security headers with Helmet.js

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

## Credits

Original tutorial: https://www.youtube.com/watch?v=K8YELRmUb5o
Discord: https://discord.gg/2FfPeEk2mX
