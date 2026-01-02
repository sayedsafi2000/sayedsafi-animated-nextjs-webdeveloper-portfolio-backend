# Sayed Safi Portfolio Backend API

Backend API built with Node.js, Express.js, and MongoDB for managing Blog posts, Projects, and Services.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose
- ✅ JWT authentication for admin access
- ✅ CRUD operations for Blog, Projects, and Services
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ CORS support for frontend and admin dashboard

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sayed-safi-portfolio
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3001
```

4. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas cloud database
```

5. Run the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new admin user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Blog Posts

- `GET /api/blog` - Get all blog posts (Public)
- `GET /api/blog/:slug` - Get single blog post by slug (Public)
- `POST /api/blog` - Create blog post (Admin only)
- `PUT /api/blog/:id` - Update blog post (Admin only)
- `DELETE /api/blog/:id` - Delete blog post (Admin only)

### Projects

- `GET /api/projects` - Get all projects (Public)
- `GET /api/projects/:id` - Get single project (Public)
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Services

- `GET /api/services` - Get all services (Public)
- `GET /api/services/:id` - Get single service (Public)
- `POST /api/services` - Create service (Admin only)
- `PUT /api/services/:id` - Update service (Admin only)
- `DELETE /api/services/:id` - Delete service (Admin only)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Models

### User
- username, email, password, role

### Blog
- slug, title, excerpt, content, date, readTime, category, image, link, tags, author, published, views

### Project
- title, description, category, image, tags, link, github, featured, isCustomCode, order

### Service
- title, description, icon, color, features, price, order, active

## Development

The backend uses ES6 modules. Make sure your Node.js version supports ES modules (v14+).

## License

ISC

