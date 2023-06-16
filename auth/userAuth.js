const tokens = require('../model/tokenModel');
const utils = require('../utils/tokenUtil');

const userAuth = async (req, res) => {
    try {
        if(req.cookies.satoken && req.cookies.sareftoken){
            const verifiedAccessToken = utils.verifyAccessToken(req.cookies.satoken,process.env.ACCESS_SECRET_KEY);
            if(verifiedAccessToken && (verifiedAccessToken !== 403)){
                return {accessToken:req.cookies.satoken,refreshToken:req.cookies.sareftoken,loggedUser:verifiedAccessToken.name}
            }else{
                const matchRefToken = await tokens.findOne({refreshToken:req.cookies.sareftoken});
                if(matchRefToken){
                    const verifiedRefreshToken = utils.verifyRefreshToken(req.cookies.sareftoken,process.env.REFRESH_SECRET_KEY);
                    if(verifiedRefreshToken && (verifiedRefreshToken !== 403)){
                        const newAccessToken = utils.generateAccessToken({_id:verifiedRefreshToken._id,name:verifiedRefreshToken.name});
                        const newRefreshToken = utils.generateRefreshToken({_id:verifiedRefreshToken._id,name:verifiedRefreshToken.name});
                        await tokens.findByIdAndUpdate({_id:matchRefToken._id},{refreshToken:newRefreshToken});
                        return {accessToken:newAccessToken,refreshToken:newRefreshToken,loggedUser:verifiedRefreshToken.name}
                    }else{
                        await tokens.findByIdAndRemove({_id:matchRefToken._id});
                        return undefined;
                    }
                }else{
                    return undefined;
                }
            }
        }else{
            return undefined;
        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    userAuth,
}