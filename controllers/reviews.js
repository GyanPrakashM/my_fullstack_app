const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        const newReview = new Review(req.body.review);

        newReview.author = req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "New Review Created!");
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error("Error creating review:", err);
        req.flash("error", "Something went wrong while creating the review.");
        res.redirect("back");
    }
};

module.exports.destroyReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error deleting review:", err);
        req.flash("error", "Something went wrong while deleting the review.");
        res.redirect("back");
    }
};
