// models 
const usersModel = require('../model/userModel');
const CourseModel = require('../model/CourseModel');
const tokenModel = require('../model/tokenModel');
const queryModel = require('../model/QueryModel');
const utils = require('../utils/tokenUtil');
const slug = require('slug');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const QueryModel = require('../model/QueryModel');
const SiteModel = require('../model/SiteModel');


const cookieOption1 = {
    maxAge:Date.now()+60*60*1000, 
    httpOnly: true, 
}

const cookieOption2 = {
    maxAge:Date.now()+30*24*60*60*1000, 
    httpOnly: true,
}





const Login = async (req, res) => {
    try {
        const matchUser = await usersModel.findOne({ email: req.body.email });
        if (matchUser) {
            const matchPassword = bcrypt.compare(req.body.password, matchUser.password);
            if (matchPassword) {
                if (matchUser.roles.includes("admin") || matchUser.roles.includes("super_admin")) {
                    // generating access token and refresh token
                    const newAccessToken = utils.generateAccessToken(matchUser._id, matchUser.name);
                    const newRefreshToken = utils.generateRefreshToken(matchUser._id, matchUser.name);
                    res.cookie("satoken",newAccessToken,cookieOption1);
                    res.cookie("sareftoken",newRefreshToken,cookieOption2);
                    // removing previouse stored token from db
                    const matchToken = await tokenModel.findOne({id:matchUser._id});
                    if(matchToken) await tokenModel.findByIdAndRemove({_id:matchToken._id});
                    // storgin refreshToken in db
                    const RefreshTokenStatus = new tokenModel({ id: matchUser._id, refreshToken: newRefreshToken }).save();
                    if (RefreshTokenStatus) {
                        res.status(200).send({ message: "Accessed!" });
                    }else{
                        res.status(401).send({ message: "Please enter valid email or password" });
                    }
                }else{
                    res.status(401).send({ message: "Please enter valid email or password" });
                }
            } else {
                res.status(401).send({ message: "Please enter valid email or password" });
            }
        } else {
            res.status(401).send({ message: "Please enter valid email or password" });
        }
    } catch (error) {
        return res.status(500).send({ message:"Internal server error"});
    }
}


const getDashboard = async(req, res) => {
    try {
        res.status(200).send({ message: "All good from dashboard!" });
    } catch (error) {
        return res.status(500).send({ message: "Internal server error"});
    }
}

const getContentWrite = async(req, res) => {
    try {
        const getCourseDetails = await CourseModel.findOne({title: req.params.courseName});
        if(getCourseDetails){
            res.status(200).send({message:"All gooo from Content Write Controller!"});
        }else{
            res.status(404).send({message:"Course not found!"});
        }
    } catch (error) {
        res.status(500).send({message:"Internal server error!"});
    }
}



const getUsers = async (req, res) => {
    try {
        const usersList = await usersModel.find();
        res.status(200).send({ usersList });
    } catch (error) {
        res.status(500).send({ message: "Internal server error!" });
    }
}


const getCourseList = async (req, res) => {
    try {
        const courses = await CourseModel.find();
        const courseList = courses.map((item) => {
            return { _id: item._id, title: item.title, thumbnail: item.thumbnail, description: item.description,islive:item.islive }
        });
        res.status(200).send({ courseList });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });  
    }
}


const getContents = async(req, res) => {
    try {
        const response = await CourseModel.findOne({title:req.params.courseName});
        if(response){
            res.status(200).send({message:"sending data",contentList:response.contents});
        }else{
            res.status(404).send({message:"content not found!"});
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}

const getContentToUpdate = async(req, res) => {
    try {
        const response = await CourseModel.find(
            {title:req.params.courseName},
            {_id:0,contents:{$elemMatch:{slug:req.params.slug}}} 
        );
        if(response){
            const content = response[0].contents[0];  
            res.status(200).send({content});
        }else{
            res.status(404).send({message:"Content not found!"});
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}

const AddCourse = async(req,res) => {
    try {
        // console.log(req.body);
        const response = await new CourseModel(req.body).save();
        if(response){ res.status(200).send({message:"Course Added Succussfuly!"})}
        else{res.status(500).send("Internal Server Error")}
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
}


const WriteContent = async(req, res) => {
    try {
        const getSlug = slug(req.body.topic);
        const response = await CourseModel.findOneAndUpdate(
            {title:req.params.courseName},
            {$push:{contents:{topic:req.body.topic,slug:getSlug,content:req.body.contents}}}
        );
        if(response) res.status(200).send({message:"Content Added Successfuly!"});
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
}

const UpdateContent = async(req, res) => {
    try {
        const getSlug = slug(req.body.topic);
        const response = await CourseModel.updateOne(
            {title:req.params.courseName,"contents.slug":req.params.slug},
            {$set:{
                "contents.$.slug":getSlug,
                "contents.$.topic":req.body.topic,
                "contents.$.content":req.body.contents
            }}
        );
        if(response) res.status(200).send({message:"Content updated successfully!"});
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
}


const DeleteCourse = async( req, res ) =>{
    try {
        const user = utils.verifyAccessToken(req.cookies.satoken,process.env.ACCESS_SECRET_KEY);
        const getUser = await usersModel.findOne({_id:user._id});
        if( !getUser.roles.includes('super_admin')){
            return res.status(403).send({message:"You are not authorized for this."});
        }
        const response = await CourseModel.findByIdAndDelete({_id: req.params.courseId});
        if(response) res.status(200).send({message:"Course deleted successfully"});
    } catch (error) {
        send.status(500).send({message:"Internal Server Error"});
    }
}



const DeleteContent = async(req, res) => {
    try {
        const response = await CourseModel.findOneAndUpdate(
            {title:req.params.courseName},
            {$pull:{contents:{slug:req.params.slug}}}
        );
        if(response){
            res.status(200).send({message:"Content deleted successfully"});
        }else{
            res.status(404).send({message:"Content not found"});
        }
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
}


const getUpdateCourse = async(req, res)=>{
    try {
        const getCourse = await CourseModel.findOne({_id:req.params.courseId});
        const courseDetails = {_id:getCourse._id,title:getCourse.title,description:getCourse.description,thumbnail:getCourse.thumbnail,islive:getCourse.islive};
        if(!courseDetails){
            return res.status(404).send({message: 'Course not found'});
        }
        return res.status(200).send({courseDetails:courseDetails});
    } catch (error) {
        return res.status(500).send({message:"Internal Server Error"});
    }
}



const UpdateCourse = async(req, res) => {
    try {
        const getCourse = await CourseModel.findOne({_id: req.params.courseId});
        if(!getCourse) {
            return res.status(404).send({message:"Course not found"});
        }
        const updateCourseStatus = await CourseModel.findByIdAndUpdate({_id:getCourse._id},{$set:{
            title: req.body.title,
            description: req.body.description,
            thumbnail:req.body.thumbnail,
            islive:req.body.islive,
        }});
        if(updateCourseStatus){
            return res.status(200).send({message:"Course details updated successfully!"});
        }else{
            return res.status(500).send({message:"Course details not updated, please try again"});
        }
    } catch (error) {
        return res.status(500).send({message:"Internal Server Error"});
    }
}


const getQueries = async(req, res) => {
    try {
        const queries = await queryModel.find();
        // console.log(queries);
        if(!queries){
            return res.status(404).send({message:"Queries not found!",queries:"undefined"});
        }
        return res.status(200).send({queries:queries});
    } catch (error) {
        return res.status(500).send({message:"Internal server error!"});
    }
}





const QueryReply = async(req, res) => {
    let setReplyStatus = null;
    try{
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.email,
                pass: process.env.password
            }
        });

        const getAdmin  = utils.verifyRefreshToken(req.cookies.sareftoken,process.env.REFRESH_SECRET_KEY);
        // store replies in db with replied by - name, id
        
        setReplyStatus = await QueryModel.findByIdAndUpdate({_id:req.body.id},{$push:{replies:{senderId:getAdmin._id,senderName:getAdmin.name,reply:req.body.message}}});

        console.log(req.body.to);
        // if stored successfully then send mail
        const sendEmailStatus = await transporter.sendMail({
            from: `${process.env.email}`,
            to: `${req.body.to}`,
            subject: "Reply to your query",
            html: `<p>Hi ${req.body.name}, <br><br>${req.body.message}<br><br><span><strong>Thanks & Regards</strong></span><br><span>Team Skill Ascent</span>`
        });
        if(sendEmailStatus){
            return res.status(200).send({message:"The reply has been sent successfully!"});
        }

    }catch(error){
        console.log(error);
        if(setReplyStatus){
            // delete stored data from db
            await QueryModel.findOneAndUpdate({_id:req.body.id},{$pull:{replies:{reply:req.body.message}}});
        }
        return res.status(500).send({message:"Internal server error!"});
    }
}


const getReplies = async(req, res) => {
    try{
        const queryData = await queryModel.findOne({_id:req.params.replyId});
        if(queryData){
            return res.status(200).send({repliesList:queryData.replies});
        }
    }catch(error){
        return res.status(500).send({message:"Internal server error!",repliesList:[]});
    }
}

const deleteQuery = async(req, res)=>{
    try{
        await QueryModel.findByIdAndDelete({_id:req.params.queryId});
        const newQueryList = await QueryModel.find();
        return res.status(200).send({message:"Query deleted successfully", newQueryList:newQueryList});
    }catch(error){
        return res.status(500).send({message:"Internal server error while deleting query!"});
    }
}


const getPrivacyPolicy = async(req, res) => {
    try{
        const response = await SiteModel.find();
        if(response){
            return res.status(200).send({privacyData:response[0].privacyPolicy});
        }
        return res.staus(200).send({privacyData:'undefined'});
    }catch(error){
        return res.status(500).send({message:"Internal server error"});
    }
}


const getDisclamer = async(req,res)=>{
    try{
        const response = await SiteModel.find();
        if(response){
            return res.status(200).send({disclamerData:response[0].disclamer});
        }
        return res.status(200).send({disclamerData:'undefined'});
    }catch(error){
        return res.status(500).send({message:"Internal server error"});
    }
}

const setDisclamer = async(req, res) => {
    try{
        const isDataExist = await SiteModel.find();
        if(isDataExist.length>0){
            await SiteModel.findByIdAndUpdate({_id:isDataExist[0]._id},{$set:{disclamer:req.body.content}});
        }else{
            await new SiteModel({disclamer:req.body.content}).save();
        }
        return res.status(200).send({message:"Disclamer updated!"});
    }catch(error){
        return res.status(500).send({message:"Internal server error"});
    }
}

const setPrivacyPolicy = async(req, res) => {
    try{
        const isDataExist = await SiteModel.find();
        if(isDataExist.length>0){
            await SiteModel.findByIdAndUpdate({_id:isDataExist[0]._id},{$set:{privacyPolicy:req.body.content}});
        }else{
            await new SiteModel({privacyPolicy:req.body.content}).save();
        }
        return res.status(200).send({message:"Privacy Policy Updated!"});
    }catch(error){
        console.log(error);
        return res.status(500).send({message:"Internal server error"});
    }
}



module.exports = {
    Login,
    getDashboard,
    getUsers,
    getCourseList,
    AddCourse,
    getContentWrite,
    WriteContent,
    DeleteCourse,
    getContents,
    DeleteContent,
    getContentToUpdate,
    UpdateContent,
    getUpdateCourse,
    UpdateCourse,
    getQueries,
    QueryReply,
    getReplies,
    deleteQuery,
    getPrivacyPolicy,
    getDisclamer,
    setDisclamer,
    setPrivacyPolicy
}