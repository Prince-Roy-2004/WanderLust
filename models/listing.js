const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {                   //Learnt this "set" part
        type : String,
        default : "https://images.unsplash.com/photo-1750779941284-09ee2d6a619c?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set : (v) => 
            v === ""
            ? "https://images.unsplash.com/photo-1750779941284-09ee2d6a619c?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            :v
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