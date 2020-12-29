import mongoose from 'mongoose';
import moment from 'moment';
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    movieId: {type:Number, required: true},
    username:  { type: String, required: true},
    ratedScore:{type:Number},
    create_time  : {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')}
  });

  ratingSchema.statics.findByid = function (id) {
    return this.findOne({ movieId: id });
  };

  export default mongoose.model('Rating', ratingSchema);
