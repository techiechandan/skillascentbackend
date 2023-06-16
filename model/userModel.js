const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    course:{
        type:String,
        required: true,
    },
    state:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
    },
    roles:{
        type:[String],
        enum:["user","admin","super_admin"],
        default:["user"]
    },
});

module.exports = mongoose.model("User",userSchema);