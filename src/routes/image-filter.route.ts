import { Router } from 'express';
import { getFilteredImages } from '../controllers';

const router = Router();

router.get('/filteredimage', getFilteredImages);

export const imageFilterRouter = router;
