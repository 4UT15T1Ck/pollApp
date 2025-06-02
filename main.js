import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js'; 
import mongoInstance from './src/configs/mongoose.config.js';
import { sendError } from './src/utils/response.util.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const connectString = process.env.MONGODB_URI;
  if (!connectString) {
    console.error("FATAL ERROR: MONGODB_URI is not defined.");
    process.exit(1);
  }
  console.log('Connecting to MongoDB...');
  await mongoInstance.connect(connectString);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRouter);

  app.use((req, res, next) => {
    sendError(res, 'Resource not found.', 404);
  });

  app.use((err, req, res, next) => {
    console.error("Global Error Handler:",err.stack);
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return sendError(res, 'Validation Error', 400, errors);
    }
    if (err.code === 11000) {
        return sendError(res, 'Duplicate field value entered', 409); 
    }
    sendError(res, err.message || 'An unexpected error occurred.', err.statusCode || 500);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation (example): http://localhost:${PORT}/api`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
