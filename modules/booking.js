const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },

isPaid: {
    type: Boolean,
    default: false
  }

});

module.exports = mongoose.model('Booking', bookingSchema);
