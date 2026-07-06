// ⚠️ dotenv MUST be the very first statement so all process.env values are
// populated before any other module (e.g. GeminiProvider, FirebaseAdmin)
// runs its module-level initialization code.
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRouter from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for React Frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or any origin dynamically to support credentials
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing Middleware
app.use(express.json());

// Base Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    authBypass: false
  });
});

// Register API Routes
app.use('/api', apiRouter);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Boot Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  CareerPilot Backend API Server is running`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});
