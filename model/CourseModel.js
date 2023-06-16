const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title:{
        type: String,
        unique: true,
        required: true,
    },
    description:{
        type:String,
        required: true,
    },
    thumbnail:{
        type:String,
        required: true,
    },
    islive:{
        type:Boolean,
        required: true,
        default: false,
    },
    contents:{
        type:[Object],
    }
});


module.exports = mongoose.model('Course',CourseSchema);
