const mongoose = require('mongoose');

const uri = process.env.URI;
const Connect = async()=>{
    try{
        // const status = mongoose.connect('mongodb://127.0.0.1:27017/SkillAscent');
        const status = await mongoose.connect(`${uri}`);
        if(status){
            console.log("Connected to database!");
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = Connect