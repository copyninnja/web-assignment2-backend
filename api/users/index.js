import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel';
import nodemailer from 'nodemailer';
import xoauth2 from 'xoauth2';
const router = express.Router(); // eslint-disable-line
let transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true, 
  auth: {
      user: "daniel_gongxf@163.com", // 发件人邮箱
      pass: process.env.MailPassword
  }
});

// Get all users
router.get('/', (req, res, next) => {
  User.find().then(users => res.status(200).json(users)).catch(next);
});

// Register OR authenticate a user
router.post('/', async (req, res, next) => {
  // console.log(req.body)
  if (!req.body.username || !req.body.password) {
    res.status(401).json({
      success: false,
      msg: 'Please pass username and password.',
    });
  }
  if (req.query.action === 'register') {
    const rep = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

    if (req.body.password.match(rep)) {
      if (req.body.mail) {
        var mailOptions = {
          from: '"xf gong"<daniel_gongxf@163.com>',
          to: req.body.mail, 
          subject: ' | new message !',
          text: "welcome world"
        }
        transporter.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              res.redirect('/');
          }
      });
    }
      await User.create(req.body).catch(next);
      res.status(201).json({
        code: 201,
        msg: 'Successful created new user.',
      });
    } else {
      res.status(401).json({
        success: false,
        msg: 'BAD PASSWORD',
      })
    }
  } else {
    const user = await User.findByUserName(req.body.username).catch(next);
    if (!user) return res.status(401).json({
      code: 401,
      msg: 'Authentication failed. User not found.'
    });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        const token = jwt.sign(user.username, process.env.SECRET);
        process.env.Token = token;
        // return the information including token as JSON
        res.status(200).json({
          success: true,
          token: 'BEARER ' + token,
        });
      } else {
        res.status(401).json({
          code: 401,
          msg: 'Authentication failed. Wrong password.'
        });
      }
    });
  }
});

// Update a user
router.put('/:id', (req, res, next) => {
  if (req.body._id) delete req.body._id;
  User.update({
      _id: req.params.id,
    }, req.body, {
      upsert: false,
    })
    .then(user => res.json(200, user)).catch(next);
});

//Add a favourite. No Error Handling Yet. Can add duplicates too!
router.post('/:userName/favourites', async (req, res, next) => {
  const newFavourite = req.body.id;
  const userName = req.params.userName;
  const movie = await movieModel.findByMovieDBId(newFavourite).catch(next);
  if (!movie) return res.status(401).json({
    code: 401,
    msg: 'failed. movie not found.'
  });
  const user = await User.findByUserName(userName);
  const favouriteId = await User.findByFavouriteId(movie._id).catch(next);
  if (!favouriteId) {
    await user.favourites.push(movie._id);
  }
  await user.save();
  res.status(201).json(user);
});

router.get('/:userName/favourites', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('favourites').then(
    user => res.status(201).json(user.favourites)
  ).catch(next);
});

router.get('/:userName/ratings', (req, res, next) => {
  const isEnabled = req.optimizely.client.isFeatureEnabled(
    'Assignment2',       // Feature key connecting feature to UI
    '',           // String ID used for random percentage-based rollout
    {
      username: req.params.userName   // Attributes used for targeted audience-based rollout
    }
  );if(isEnabled){
  const userName = req.params.userName;
  User.findByUserName(userName).populate('ratings').then(
    user => res.status(201).json(user.ratings)
  ).catch(next);}
  else{
    res.send({
      "success" : "feature off"
    })
  }
});

router.get('/:userName/reviews', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('reviews').then(
    user => res.status(201).json(user.reviews)
  ).catch(next);
});

export default router;