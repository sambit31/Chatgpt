import express from 'express';
import { authToken } from '../middlewares/auth.middlewares.js';
import { createChat } from '../controllers/chat.controllers.js';
import { get } from 'mongoose';
import { getchats } from '../controllers/chat.controllers.js';

const router = express.Router();

router.post('/',authToken,createChat)

router.get('/',authToken,getchats);


export default router;