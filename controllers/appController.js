const userAuth = require('../auth/userAuth');
const CourseModel = require('../model/CourseModel')
const QueryModel = require('../model/QueryModel');
const SiteModel = require('../model/SiteModel');


const cookieOption1 = {
    maxAge:Date.now()+60*60*1000, 
    httpOnly: true,
    domain: ".onrender.com",
    sameSite: "none",
    secure:true,
}

const cookieOption2 = {
    maxAge:Date.now()+30*24*60*60*1000, 
    httpOnly: true,
    domain: ".onrender.com",
    sameSite: "none",
    secure:true,
}


const getHome = async (req, res) => {
    try {
        // do something here

        // sending response
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined", accessToken:'undefined', refreshToken:'undefined' });
        } else {
            res.status(200).send({ loggedUser: getLoggedData.loggedUser, accessToken:getLoggedData.accessToken, refreshToken:getLoggedData.refreshToken});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const getAbout = async (req, res) => {
    try {
        // do something here

        // sending response
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.status(200).send({ loggedUser: getLoggedData.loggedUser,accessToken:getLoggedData.accessToken, refreshToken:getLoggedData.refreshToken });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}


const getContact = async (req, res) => {
    try {
        // do something here

        // sending response
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}





const getCourses = async (req, res) => {
    try {
        const courses = await CourseModel.find();
        let courseList = [];
        if (courses) {
            courseList = courses.map((item) => {
                return { _id: item._id, title: item.title, description: item.description, thumbnail: item.thumbnail,islive:item.islive}
            })
            courseList = courseList.filter(item => item.islive === true);
        }
        // getting logged user details
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined",courseList: courseList });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser,courseList: courseList });
        }
    } catch (error) {
        console.log(error);
    }
}


const getContents = async (req, res) => {
    try {
        // do something here
        let contents;
        const response = await CourseModel.findOne({ title: req.params.courseName });
        if (response) {
            contents = response.contents;
        } else {
            contents = undefined;
        }
        // sending response
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            const response = await CourseModel.findOne({ title: req.params.courseName });
            return res.status(200).send({ loggedUser: "undefined", contents: contents,description:response.description });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser, contents: contents,description:response.description });
        }
    } catch (error) {
        console.log(error);
    }
}

const getContent = async (req, res) => {
    try {
        // do something here
        let content;
        const response = await CourseModel.findOne({ title: req.params.courseName });
        if (response) {
            content = response.contents.find(item => item.slug === `${req.params.topicName}`);
        } else {
            content = undefined;
        }
        // sending response
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined", content: content });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser, content: content });
        }
    } catch (error) {
        console.log(error);
    }
}


const SetQuery = async(req, res) =>{
    try{
        const response = await new QueryModel({name:req.body.name,email:req.body.email,query:req.body.query}).save();
        res.cookie('satoken',req.cookies.satoken,cookieOption1);
        res.cookie('sareftoken',req.cookies.sareftoken,cookieOption2);
        if(response){ 
            res.status(200).send({message:"Your query has been received successfuly!"});
        }else{
            res.status(500).send({message:"Internal server error"});
        }
    }catch(error){
        console.log(error);
        res.status(500).send({message:"Internal server error"});
    }
}


const getDisclamer = async(req, res) => {
    try{
        let disclamerData;
        const response = await SiteModel.find();
        if(response.length>0){
            disclamerData = response[0].disclamer;
        }else{
            disclamerData = "undefined"
        }      

        const LoggedUser = await userAuth.userAuth(req, res);
        if(LoggedUser !== undefined){
            res.cookie('satoken', LoggedUser.accessToken, cookieOption1);
            res.cookie('sareftoken', LoggedUser.refreshToken, cookieOption2);
            return res.status(200).send({disclamerData:disclamerData,LoggedUser:LoggedUser.loggedUser});
        }else{
            return res.status(200).send({disclamerData:disclamerData, LoggedUser:'undefined'});
        }

    }catch(error){
        return res.status(500).send({message:"Internal server error!"});
    }
}

const getPrivacyPolicy = async(req,res) =>{
    try{
        let privacyPolicy;
        const response = await SiteModel.find();
        if(response.length>0){
            privacyPolicy = response[0].privacyPolicy;
        }else{
            privacyPolicy = "undefined"
        }      
        
        const LoggedUser = await userAuth.userAuth(req, res);
        if(LoggedUser !== undefined){
            res.cookie('satoken', LoggedUser.accessToken, cookieOption1);
            res.cookie('sareftoken', LoggedUser.refreshToken, cookieOption2);
            return res.status(200).send({PrivacyPolicy:privacyPolicy,LoggedUser:LoggedUser.loggedUser});
        }else{
            return res.status(200).send({PrivacyPolicy:privacyPolicy, LoggedUser:'undefined'});
        }

    }catch(error){
        return res.status(500).send({message:"Internal server error!"});
    }
}

module.exports = {
    getHome,
    getAbout,
    getContact,
    getCourses,
    getContents,
    getContent,
    SetQuery,
    getDisclamer,
    getPrivacyPolicy,
}