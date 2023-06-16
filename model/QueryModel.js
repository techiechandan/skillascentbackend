const mongoose = require('mongoose');

const QuerySchema = mongoose.Schema;

const QueryModel = new QuerySchema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    query:{
        type:String,
        required:true,
    },
    replies:{
        type:[Object],
        required:false,
    },
})






module.exports = mongoose.model('Query',QueryModel);