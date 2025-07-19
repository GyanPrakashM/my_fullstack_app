
const Listing = require("../models/listing");
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async(req,res) => {
 const allListings =  await Listing.find({});
 res.render("listings/index", {allListings});
};


  module.exports.renderNewForm = (req, res) => { 
  res.render("listings/new");
};

module.exports.showlisting = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({path:"reviews" , 
      populate:
      { path:"author",

     },
         })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show", { listing });
};


module.exports.createlisting = async (req, res, next) => {

  let response =  await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()

 


  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
   newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
   console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");

};


// module.exports.createlisting = async (req, res, next) => {
//     console.log("BODY:", req.body);
//     console.log("FILE:", req.file);
  
//     return res.send(req.file);  
// };


  module.exports.renderEditform = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings"); 
    }

    let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit",{listing,originalImageUrl})
  };

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};


  module.exports.distroyListing = async (req,res) => {
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success","Listing Deleted !");
     res.redirect("/listings");
  };