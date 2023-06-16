const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    id:{
        type: String,
        required: true,
        unique: true,
    },
    refreshToken:{
        type: String,
        required: true,
        unique: true,
    }
});

module.exports = mongoose.model("token",tokenSchema);