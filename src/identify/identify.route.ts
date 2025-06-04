import express from 'express'
import { IdentifyUser } from './identify.controller';

const router = express.Router();

router.post('/identify', IdentifyUser);

export default router;
