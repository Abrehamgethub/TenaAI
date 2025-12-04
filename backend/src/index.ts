import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config';
import { initializeFirebase } from './config/firebase';
import { logger, morganStream } from './services/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

// Initialize Express app
const app = express();

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  logger.error('Failed to initialize Firebase, continuing without it:', error);
}

// Trust proxy (required for Cloud Run)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: morganStream }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TenaAI Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API info endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TenaAI API',
    version: '1.0.0',
    description: 'AI-powered personalized learning and career navigation platform for Ethiopian youth',
    documentation: '/api',
    endpoints: {
      roadmap: 'POST /api/roadmap - Generate personalized learning pathway',
      explain: 'POST /api/explain - AI tutor explaining STEM concepts',
      opportunities: 'POST /api/opportunities - Recommend internships/scholarships',
      skillsEval: 'POST /api/skills-eval - Evaluate skills and suggest next steps',
      profile: {
        save: 'POST /api/profile/save - Save progress',
        get: 'GET /api/profile/get - Load user progress',
      },
    },
  });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 TenaAI Backend Server Started                            ║
║                                                               ║
║   Port:        ${PORT}                                          ║
║   Environment: ${config.nodeEnv.padEnd(43)}║
║   Health:      http://localhost:${PORT}/health                  ║
║   API Docs:    http://localhost:${PORT}/                        ║
║                                                               ║
║   Ready to empower Ethiopian youth! 🇪🇹                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
