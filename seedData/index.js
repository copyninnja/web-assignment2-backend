import userModel from '../api/users/userModel';
import movieModel from '../api/movies/movieModel';
import ratingModel from '../api/rating/ratingModel';
import reviewModel from '../api/reviews/reviewModel';
import {
  movies
} from './movies.js';
import {
  reviews
} from './review';
import {
  ratings
} from './rating';
const users = [{
    'username': 'user1',
    'password': 'test1',
  },
  {
    'username': 'user2',
    'password': 'test2',
  },
];

// deletes all user documents in collection and inserts test data
export async function loadUsers() {
  console.log('load user Data');
  try {

    await userModel.deleteMany();
    await users.forEach(user => userModel.create(user));

    const movie1 = await movieModel.findByMovieDBId(741067);
    const movie2 = await movieModel.findByMovieDBId(577922);
    const movie3 = await movieModel.findByMovieDBId(400160);
    const movie4 = await movieModel.findByMovieDBId(635302);
    const user1 = await userModel.findByUserName(users[0].username);
    const user2 = await userModel.findByUserName(users[1].username);
    user1.favourites.push(movie1._id);
    user2.favourites.push(movie2._id);
    user2.favourites.push(movie3._id);
    user2.favourites.push(movie4._id);
    user1.save();
    user2.save();
    console.info(`${users.length} users were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load user Data: ${err}`);
  }
}
// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
  console.log('load seed data');
  try {
    await movieModel.deleteMany();
    await movieModel.collection.insertMany(movies);
    console.info(`${movies.length} Movies were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load movie Data: ${err}`);
  }
}

export async function loadRatings() {
  console.log('load rating data');
  try {
    await ratingModel.deleteMany();
    await ratingModel.collection.insertMany(ratings);
    const user = await userModel.findByUserName(ratings[0].username);
    const movie = await movieModel.findByMovieDBId(ratings[0].movieId);
    user.ratings.push(ratings[0]._id);
    movie.ratings.push(ratings[0]._id);
    user.save();
    movie.save();
    console.info(`${ratings.length} ratings were successfully stored.`);

  } catch (err) {
    console.error(`failed to Load rating Data: ${err}`);
  }
}

export async function loadReviews() {
  console.log('load review data');
  try {
    await reviewModel.deleteMany();
    await reviewModel.collection.insertMany(reviews);
    const review = await reviewModel.findByReviewId(577922);
    const movie = await movieModel.findByMovieDBId(577922);
    // console.log(review[0]._id);
    const addReview = review.map((rev) =>
      movie.reviews.push(rev._id)
    );
    movie.save();
    console.info(`${review.length} reviews were successfully stored.`);
  } catch (err) {
    console.error(`failed to Load review Data: ${err}`);
  }
}