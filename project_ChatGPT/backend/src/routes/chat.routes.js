import express from 'express';
import { authToken } from '../middlewares/auth.middlewares.js';
import { createChat } from '../controllers/chat.controllers.js';

const router = express.Router();

router.post('/',authToken,createChat)


export default router;