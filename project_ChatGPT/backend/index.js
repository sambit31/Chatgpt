import express from 'express';
import dotenv from 'dotenv';
import cookies from 'cookie-parser';
import connectDB from './src/db/db.mongoose.js';
import authRoutes from './src/routes/auth.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import { createServer } from 'http';
import {initSocketServer} from './src/sockets/socket.server.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookies());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Hello, ChatGPT Backend!');
});

// Create ONE HTTP server
const httpServer = createServer(app);

// Attach socket.io to *this* server
initSocketServer(httpServer);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running with Socket.io on port:${PORT}`);
});
