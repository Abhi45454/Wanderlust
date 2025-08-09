const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../modules/booking');
const Listing = require('../modules/listing');
const { isLoggedIn } = require('../middleware');


router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      endpointSecret
    );
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.isPaid = true;
          await booking.save();
          console.log(`✅ Booking ${bookingId} marked as paid.`);
        }
      } catch (err) {
        console.error("❌ Failed to update booking:", err);
      }
    }
  }

  res.status(200).json({ received: true });
});



router.post('/create-checkout-session/:bookingId', isLoggedIn, async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate('listing');
  if (!booking) return res.status(404).send('Booking not found.');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    metadata: {
      bookingId: booking._id.toString(), 
    },
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: `Stay at ${booking.listing.title}`,
          description: `${booking.guests} guest(s), from ${booking.checkIn.toDateString()} to ${booking.checkOut.toDateString()}`
        },
        unit_amount: booking.totalPrice * 100, // in paisa
      },
      quantity: 1
    }],
    
   success_url: `${req.protocol}://${req.get('host')}/my-bookings?payment=success&bookingId=${booking._id}`,
cancel_url: `${req.protocol}://${req.get('host')}/my-bookings?payment=cancelled&bookingId=${booking._id}`,


  });

  res.redirect(303, session.url);
});





module.exports = router;

