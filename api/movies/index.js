import express from 'express';

import movieModel from './movieModel';
import User from '../users/userModel';
import Rating from '../rating/ratingModel';
import Review from '../reviews/reviewModel';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', (req, res, next) => {
  movieModel.find().then(movies => res.status(200).send(movies)).catch(next);
});

router.get('/:id', async(req, res, next) => {
  const id = parseInt(req.params.id);
  const movie = await movieModel.findByMovieDBId(id).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  else{
    res.status(200).send(movie)
  }
});


router.post('/:id/rating', async (req, res, next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const newRating = req.params.id;
  const rate = req.body.value;
  const movie = await movieModel.findByMovieDBId(newRating).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  const user = await User.findByUserName(userName);
  const ratingId = await User.findByRatedId(movie._id).catch(next);
  if (!ratingId) {

    await Rating.create({
      "movieId": req.params.id,
      "username": userName,
      "ratedScore": rate
    }).catch(next);
    const rating = await Rating.findByid(newRating).catch(next);
    await user.ratings.push(rating._id);
    await movie.ratings.push(rating._id);
    await user.save();
    await movie.save();
  }
  res.status(201).json("successfully add rating");
});

router.delete('/:id/rating', async (req, res, next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const newRating = req.params.id;
  const movie = await movieModel.findByMovieDBId(newRating).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  // console.log(token);
  const user = await User.findByUserName(userName);
  const ratingId = await User.findByRatedId(movie._id).catch(next);
  if (ratingId) {
    await user.ratings.remove(movie._id);
    await movie.ratings.remove(movie._id);
    await Rating.deleteOne({
      "movieId": req.params.id
    }).catch(next);
    await user.save();
  }
  res.status(201).json("successfully delete");
});

router.put('/:id/rating', async (req, res, next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const newRating = req.params.id;
  const rate = req.body.value;
  const movie = await movieModel.findByMovieDBId(newRating).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  const user = await User.findByUserName(userName);
  const ratingId = await User.findByRatedId(movie._id).catch(next);
  if (ratingId) {
    await Rating.findOneAndUpdate({
      "username":userName
    },{
      "ratedScore": rate
    }).catch(next);
    await user.save();
  }
  res.status(201).json("success");
})

router.get('/:id/reviews', async (req, res, next) => {
  const id = parseInt(req.params.id);
  const movie = await movieModel.findByMovieDBId(id);
  // console.log(movie.reviews);
  // const movie = await movieModel.findByMovieDBId(id).catch(next);
  movieModel.findByMovieDBId(id).populate('reviews').then(
    movie => res.status(201).json(movie.reviews)
  ).catch(next);
});

router.post('/:id/reviews', async (req, res, next) => {
  
  const author = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const Movieid = req.params.id;
  const content = req.body.content;
  const movie = await movieModel.findByMovieDBId(Movieid).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  const user = await User.findByUserName(author);
    await Review.create({
      "Movieid": Movieid,
      "author": author,
      "content": content
    }).catch(next);
    const reviewing = await Review.findByName(author).catch(next);
    // console.log(reviewing);
    await user.reviews.push(reviewing._id);
    await movie.reviews.push(reviewing._id);
    await user.save();
    await movie.save();
  
  res.status(201).json("successfully add reviewing");
});

router.delete('/:id/reviews', async (req, res, next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const newReviews = req.params.id;
  const movie = await movieModel.findByMovieDBId(newReviews).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  // console.log(token);
  const user = await User.findByUserName(userName);
  const reviewing = await Review.findByName(userName).catch(next);
  if (reviewing) {
    await user.reviews.remove(reviewing._id);
    await movie.reviews.remove(reviewing._id);
    await Review.deleteOne({
      "author": userName
    }).catch(next);
    await user.save();
  }
  res.status(201).json("successfully delete");
});

router.put('/:id/reviews', async (req, res, next) => {
  const userName = jwt.verify(process.env.TOKEN, process.env.SECRET);
  const newReviews = req.params.id;
  const content = req.body.content;
  const movie = await movieModel.findByMovieDBId(newReviews).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  const user = await User.findByUserName(userName);
  const reviewing = await Review.findByName(userName).catch(next);
  if (reviewing) {
    await Review.findOneAndUpdate({
      "author":userName
    },{"content": content}).catch(next);
    await user.save();
  }
  res.status(201).json("success");
})

export default router;