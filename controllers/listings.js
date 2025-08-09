 const Listing = require("../modules/listing");
 const { forwardGeocode } = require('../utils/locationIQ');
 const mongoose = require("mongoose");
 


module.exports.index = async (req, res) => {
  const { q, category } = req.query;
  let allListings;

  if (q && q.trim() !== "") {
    const regex = new RegExp(q, 'i'); 
    allListings = await Listing.find({
      $or: [
        { title: regex },
        { location: regex },
        { country: regex },
        { description: regex }
      ]
    });
  } else if (category && category.trim() !== "") {
    const categoryRegex = new RegExp(`^${category}$`, 'i'); 
    allListings = await Listing.find({ category: categoryRegex });
  } else {
    allListings = await Listing.find({});
  }

 
  res.render("listings/index.ejs", { allListings, category, q });
};



// new


 module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
  let {id} =req.params;
  const listing =await Listing.findById(id).populate({path: "reviews", populate: {
    path: "author",
  },
})
.populate("owner")

.populate("bookings");


  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }


const validBookings = listing.bookings.filter(b => b && b.checkIn && b.checkOut);

listing.bookedDates = validBookings.map(b => {
  const start = new Date(b.checkIn);
  const end = new Date(b.checkOut);
  const dateArray = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dateArray.push(new Date(d).toISOString().split('T')[0]);
  }

  return dateArray;
}).flat();



  const geoData = await forwardGeocode(listing.location);
  console.log(listing);
  res.render("listings/show.ejs", {listing, geoData});
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  };


  module.exports.renderEditForm = async (req,res) => {
    let {id} =req.params;
    const listing =await Listing.findById(id);
    if(!listing){
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
  };

  module.exports.updateListing = async (req,res) => {
    let {id} =req.params;
     let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
     
     if(typeof req.file !== "undefined") {
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = {url, filename};
     await listing.save();
     }

      req.flash("success", "Listing Updated!");
     res.redirect(`/listings/${id}`);
  };


  module.exports.destroyListing = async (req,res) => {
    let {id} =req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
     res.redirect("/listings");
  };


  








