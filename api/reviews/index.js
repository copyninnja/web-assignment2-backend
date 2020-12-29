
import express from 'express';
import Review from './reviewModel';



const router = express.Router(); // eslint-disable-line


router.get('/', (req, res,next) => {
    Review.find().then(rw =>  res.status(200).json(rw)).catch(next);
});

export default router;