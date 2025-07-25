const Joi = require("joi");       //For Schema Validations

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("", null)
    }).required()
});                                                      


module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().min(1).max(5),          //Min and Max value specify na korle Hoppscotch diye 50K,100K rating diye debe keu
        comment : Joi.string().required()
    }).required()
});