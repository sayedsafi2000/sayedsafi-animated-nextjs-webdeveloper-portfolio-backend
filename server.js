import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import projectRoutes from './routes/projects.js';
import serviceRoutes from './routes/services.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3001',
    'http://localhost:3000', // Explicitly allow localhost frontend
    'http://localhost:3001', // Explicitly allow localhost admin dashboard
    'http://127.0.0.1:3000', // Allow 127.0.0.1 frontend
    'http://127.0.0.1:3001', // Allow 127.0.0.1 admin dashboard
    'https://sayedsafi.me', // Your production frontend
    'https://www.sayedsafi.me', // If you have www version
    'https://admin.sayedsafi.me', // Your production admin dashboard
    'https://sayedsafi-animated-nextjs-webdevelo-gamma.vercel.app', // Vercel frontend deployment
    /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sayed-safi-portfolio')
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      code: err.code
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err
    })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

