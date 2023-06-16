const users = require('../model/userModel');
const tokens = require('../model/tokenModel');
const utils = require('../utils/tokenUtil');




const adminAuth = async (req, res, next) => {
    try {
        if (!(req.cookies.satoken && req.cookies.sareftoken)) {
            res.status(401).send({ message: "token not found" });
        } else {
            const varifyedAccessToken = utils.verifyAccessToken(req.cookies.satoken, process.env.ACCESS_SECRET_KEY);
            if (varifyedAccessToken !== 403) {
                const userDetails = await users.findOne({ _id: varifyedAccessToken._id });
                if (userDetails.roles.includes("admin") || userDetails.roles.includes("super_admin")) {
                    res.cookie("satoken", req.cookies.satoken, { httpOnly: true, });
                    res.cookie("sareftoken", req.cookies.sareftoken, { httpOnly: true, });
                    next();
                } else {
                    res.status(401).send({ message: "please enter valid email or password" });
                }
            } else if (varifyedAccessToken === 403) {
                // matching refresh token
                const matchRefreshToken = await tokens.findOne({refreshToken:req.cookies.sareftoken});
                if (matchRefreshToken) {
                    // access token expired verifying refresh token
                    const varifyedRefreshToken = utils.verifyRefreshToken(req.cookies.sareftoken, process.env.REFRESH_SECRET_KEY);
                    if (varifyedRefreshToken && varifyedRefreshToken !== 403) {
                        const userDetails = await users.findOne({ _id: varifyedRefreshToken._id });
                        if (userDetails.roles.includes("admin") || userDetails.roles.includes("super_admin")) {
                            const newAccessToken = utils.generateAccessToken({_id:userDetails._id, name:userDetails.name});
                            const newRefreshToken = utils.generateRefreshToken({_id:userDetails._id, name:userDetails.name});
                            res.cookie("satoken", newAccessToken, { httpOnly: true });
                            res.cookie("sareftoken", newRefreshToken, { httpOnly: true });
                            const newRefTokeStatus = await tokens.findByIdAndUpdate({_id:matchRefreshToken._id},{id:userDetails.id,refreshToken:newRefreshToken});
                            if(newRefTokeStatus) next();
                        }else{
                            res.status(401).send({message:"Access denied! enter valide email and password"});
                        }
                    }else if(varifyedAccessToken === 403){
                        // refresh token expired
                        await tokens.findByIdAndRemove({_id:matchRefreshToken._id});
                        res.cookie("satoken",undefined,{httpOnly:true});
                        res.cookie("sareftoken",undefined,{httpOnly:true});
                        res.status(401).send({ message:"Access denied! refreshtoken expired"});
                    }else{
                        res.status(401).send({message:"Access denied! invalid refreshtoken1"});
                    }
                }else{
                    res.status(401).send({message:"Access denied! invalid refreshtoken2"});
                }
            } else {
                res.status(401).send({message:"Access denied! invalid access token"});
            }
        }
    } catch (error) {
        res.status(500).send({message:"Internal server error!"});
        console.log(error);
    }
}



module.exports = {
    adminAuth,
}