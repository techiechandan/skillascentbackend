const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queryTokenSchema = new Schema({
    userId:{
        type:String,
        required: true,
        unique:true,
    },
    queryToken:{
        type:String,
        required:true,
        unique:true,
    },
})


module.exports = mongoose.model("QueryToken",queryTokenSchema);