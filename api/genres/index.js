import express from 'express';
import {
  getGenres
} from '../tmdb-api';
import jwt from 'jsonwebtoken';



const router = express.Router();

router.get('/', (req, res,next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);

    getGenres().then(movies => res.status(200).send(movies))
  .catch((error) => next(error));

});



export default router;