const tokens = require('../model/tokenModel')
const users = require('../model/userModel');
// utils methods
const utils = require('../utils/tokenUtil');


const cookieOption1 = {
    maxAge:Date.now()+60*60*1000, 
    httpOnly: true, 
    domain: "skillascent.in",
    sameSite: "none",
    secure:true, 
}

const cookieOption2 = {
    maxAge:Date.now()+30*24*60*60*1000, 
    httpOnly: true,
    domain: "skillascent.in",
    sameSite: "none",
    secure:true,
}



const AdminAuth = async(req,res) => {
    try {
        if(req.cookies.satoken && req.cookies.sareftoken){
            const accessTokenStatus = utils.verifyAccessToken(req.cookies.satoken,process.env.ACCESS_SECRET_KEY);
            // console.log(accessTokenStatus);
            if(accessTokenStatus === 403){
                //access token expired and checking for refresh token
                const matchRefreshToken = await tokens.findOne({refreshToken:req.cookies.sareftoken});
                if(matchRefreshToken){
                    // verifying refresh token to generate new access token
                    const refreshTokenStatus = utils.verifyRefreshToken(req.cookies.sareftoken, process.env.REFRESH_SECRET_KEY);
                    if(refreshTokenStatus === 403){
                        // refresh token expired 
                        await tokens.findByIdAndRemove({_id:matchRefreshToken._id});
                        res.status(401).send({message:"token expired please login"});
                    }else if(!refreshTokenStatus){
                        // invalid refresh token
                        res.status(401).send({message:"unauthorized access!"});
                    }else{
                        // refresh token varified generate new access token
                        // getting user details
                        const userDetails = await users.findOne({_id:refreshTokenStatus._id});
                        if(userDetails.roles.includes("admin") || userDetails.roles.includes("super_admin")){
                            const newAccessToken = utils.generateAccessToken(userDetails._id,userDetails.name);
                            const newRefreshToken = utils.generateRefreshToken(userDetails._id,userDetails.name);
                            res.cookie('satoken',newAccessToken,cookieOption1);
                            res.cookie('sareftoken',newRefreshToken,cookieOption2);
                            // storing in db
                            const newRefTokenStatus = await tokens.findByIdAndUpdate({_id:matchRefreshToken._id},{refreshToken:newRefreshToken});
                            if(newRefTokenStatus) res.status(200).send({message:"new access token generated!"});
                        }else{
                            res.status(401).send({message:"unauthorized access"});
                        } 
                    }
                }else{
                    res.status(401).send({message:"unauthorized access"});
                }
            }else if(accessTokenStatus){
                // access token varifyed 
                const userDetails = await users.findOne({_id:accessTokenStatus._id});
                if(userDetails.roles.includes("admin") || userDetails.includes("super_admin")){
                    res.cookie('satoken',req.cookies.satoken,cookieOption1);
                    res.cookie('sareftoken',req.cookies.sareftoken,cookieOption2);
                    res.status(200).send({message:"token not expired!"});
                }else{
                    res.status(401).send({message:"unauthorized access"});
                } 
            }else{
                // invalid access token
                res.status(401).send({message:"unauthorized access"});
            }
        }else{
            res.status(401).send({message:"tokens not found!"});
        }
    } catch (error) {
        res.status(500).send({message:"Internal server error!"});
        console.log(error);
    }
}


module.exports = {
    AdminAuth,
};