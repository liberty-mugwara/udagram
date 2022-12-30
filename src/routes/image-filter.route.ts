import { Router } from 'express';
import { getFilteredImages } from '../controllers';

const router = Router();

router.get('/', getFilteredImages);

export const imageFilterRouter = router;
