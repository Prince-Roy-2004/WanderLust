const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {                   
        url: String,
        filename: String
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
    },
    coordinates: {
        type: [Number],  // [lng, lat]
        required: true
    }
}

});

listingSchema.post("findOneAndDelete", async(listing) => {         //A post Mongoose Middleware to delete all reviews 
    if(listing) {                                                 // of a listing when that particular listing is deleted    
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

//Here, for the Mongoose Middleware we can use the name of any variable inside async(......), It just holds the deleted document.