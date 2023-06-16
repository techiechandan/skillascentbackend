const jwt = require('jsonwebtoken');

const generateAccessToken = ({ _id, name }) => {
    try {
        return accessToken = jwt.sign({ _id:_id, name:name }, process.env.ACCESS_SECRET_KEY, { expiresIn: "1h" });
    } catch (error) {
        console.log(error);
    }
}

const generateRefreshToken = ({ _id, name }) => {
    try {
        return refreshToken = jwt.sign({ _id:_id, name:name }, process.env.REFRESH_SECRET_KEY, { expiresIn: "30d" });
    } catch (error) {
        console.log(error);
    }
}


const verifyRefreshToken = (refreshToken, secretKey) => {
    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        return decoded;
    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            return undefined;
        }else{
            return 403;
        }
    }
}


const verifyAccessToken = (accessToken,secretKey) => {
    try {
        const decoded = jwt.verify(accessToken,secretKey);
        return decoded;
    } catch (error) {
        if(error.name === "JsonWebTokenError"){
            return undefined;
        }else{
            return 403;
        }
    }
}

const verifyQueryToken = (queryToken,secretKey) =>{
    try {
        const decoded = jwt.verify(queryToken,secretKey);
        return decoded;
    } catch (error) {
        return undefined;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyQueryToken,
}