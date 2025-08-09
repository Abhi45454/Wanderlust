const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// const { reviewSchema } = require("../schema.js");
const Review = require("../modules/review.js");
const Listing=require("../modules/listing.js"); 
const {validateReview, isLoggedIn, isReviewAuthor} =require("../middleware.js");
const reviewController = require("../controllers/review.js");


// Post Route

router.post("/",
  isLoggedIn,
   validateReview,
   wrapAsync(reviewController.createReview)
);


// Delete route

router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;  