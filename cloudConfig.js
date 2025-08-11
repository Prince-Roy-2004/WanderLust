const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');  //These two lines copied from npm multer storage cloudinary website

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,            //Configuring mtlb "Jodna" i.e. connecting our code with Cloudinary.
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({        //Defining storage, i.e. where the images will be stored.
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
    cloudinary,
    storage
}