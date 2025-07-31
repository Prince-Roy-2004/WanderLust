const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//Creating a Connection with DataBase
main().then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

//Defining The Main Function
async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner : "6887740d967de8f505ae8dc5"}));  //Reinitializing DB by adding owner for each listing
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();

//NOTE - Line 22, "map()" function creates a new array instead of making changes in the old one so, after performing the map() operation
//we again saved its result to initData.data