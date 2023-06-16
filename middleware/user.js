const tokens = require('../model/tokenModel');
const users = require('../model/userModel');
const utils = require('../utils/tokenUtil');

const userAuth = async (req, res, next) => {
    try {
        if(req.cookies.satoken && req.cookies.sareftoken){
            const verifiedAccessToken = utils.verifyAccessToken(req.cookies.satoken,process.env.ACCESS_SECRET_KEY);
            if(verifiedAccessToken && (verifiedAccessToken !== 403)){
                console.log(req.signedCookies);
            }else{
                const matchRefToken = await tokens.findOne({refreshToken:req.cookies.sareftoken});
                // console.log(matchRefToken);
                if(matchRefToken){
                    const verifiedRefreshToken = utils.verifyRefreshToken(req.cookies.sareftoken,process.env.REFRESH_SECRET_KEY);
                    console.log(verifiedRefreshToken);
                    if(verifiedRefreshToken && (verifiedRefreshToken !== 403)){
                        // const newAccessToken = utils.generateAccessToken(verifiedRefreshToken._id,verifiedRefreshToken.name)
                        // const newRefreshToken = utils.generateRefreshToken(verifiedRefreshToken._id,verifiedRefreshToken.name);
                        // await tokens.findByIdAndUpdate({_id:matchRefToken._id},{refreshToken:newRefreshToken});
                        // req.cookie('satoken',newAccessToken);
                        // req.cookie('sareftoken',newRefreshToken);
                    }else{
                        await tokens.findByIdAndRemove({_id:matchRefToken._id});
                        req.cookie('satoken',undefined);
                        req.cookie('sareftoken',undefined);
                    }
                }else{
                    req.cookie('satoken',undefined);
                    req.cookie('sareftoken',undefined);
                }
                
            }
        }
        next();
    } catch (error) {
        console.log(error);
       return res.status(500).send({message:"Internal server error!"});
    }
}


module.exports = {
    userAuth,
}