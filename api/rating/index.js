
import express from 'express';
import Rating from './ratingModel';



const router = express.Router(); // eslint-disable-line


router.get('/', (req, res,next) => {
    Rating.find().then(Ratings =>  res.status(200).json(Ratings)).catch(next);
});

export default router;