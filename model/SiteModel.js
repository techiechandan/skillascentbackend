const mongoose = require('mongoose');
const SiteSchema = mongoose.Schema;

const SiteModel = new SiteSchema({
    disclamer:{
        type:String,
        required:false,
    },
    privacyPolicy:{
        type:String,
        required:false,
    }
});


module.exports = mongoose.model("SiteData",SiteModel);