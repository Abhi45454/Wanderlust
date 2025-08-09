const express = require('express');
const router = express.Router({ mergeParams: true });
const Booking = require('../modules/booking');
const Listing = require('../modules/listing');
const { isLoggedIn } = require('../middleware');

// Create booking
router.post('/listings/:id/book', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const listing = await Listing.findById(id);

  // Simple total price calculation: price × nights
  const days = (new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24);
  const totalPrice = days * listing.price;

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice
  });
  await booking.save();

  req.flash('success', 'Booking successful!');
  res.redirect(`/listings/${id}`);
});




router.get('/my-bookings', isLoggedIn, async (req, res) => {
  const { payment, bookingId } = req.query;

  if (payment === 'success' && bookingId) {
    await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
  }

  const bookings = await Booking.find({ user: req.user._id }).populate('listing');
  res.render('bookings/index', { bookings, paymentStatus: payment, paymentBookingId: bookingId, });
});



// Cancel Booking
router.delete('/bookings/:bookingId', isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    req.flash('error', 'Booking not found.');
    return res.redirect('/my-bookings');
  }

  // Ensure user owns the booking
  if (!booking.user.equals(req.user._id)) {
    req.flash('error', 'You are not authorized to cancel this booking.');
    return res.redirect('/my-bookings');
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash('success', 'Booking cancelled.');
  res.redirect('/my-bookings');
});



module.exports = router;
