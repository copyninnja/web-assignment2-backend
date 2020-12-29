import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;


const ReviewSchema = new Schema({
  author: { type: String ,index:{unique:true}},
  content: { type: String },
  created_at: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  Movieid:  {type: Number, required:true},
  updated_at: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  url: [{ type: String }],
});

ReviewSchema.statics.findByReviewId = function (id) {
  return this.find({ Movieid: id });
};
ReviewSchema.statics.findByName = function (name) {
  return this.findOne({ author: name });
};

export default mongoose.model('Reviews', ReviewSchema);


