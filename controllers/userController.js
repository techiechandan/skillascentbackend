const bcrypt = require('bcryptjs');
const salt = 10;
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
// user model
const users = require('../model/userModel');
const tokens = require('../model/tokenModel');
const queryTokens = require('../model/QueryTokenModel');
// utils methos
const utils = require('../utils/tokenUtil');
const cookiesOption = require('../utils/CookiesOption');
const userAuth = require('../auth/userAuth')


const getRegister = async (req, res) => {
    try {

        const getLoggedData = await userAuth.userAuth(req, res);
    
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error from get-register" });
    }
}


const getLogin = async (req, res) => {
    try {
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined"});
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            return res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error form get-login" });
    }
}




const Register = async (req, res) => {
    try {
        // checking for existing user with same creadentials
        const userMatch = await users.findOne({ email: req.body.email });
        if (userMatch) {
            return res.status(404).send({ message: "This email has been already used by another user!" });
        } else {
            // password encription
            const encriptedPassword = await bcrypt.hash(req.body.password, salt);
            // saved data to db
            const newUser = await users({
                name: req.body.name,
                email: req.body.email,
                course: req.body.course,
                state: req.body.state,
                city: req.body.city,
                password: encriptedPassword,
            }).save();
            if (!newUser) {
                throw new Error({ message: "Internal server error!" })
            }
            else {
                // return response
                res.status(200).send({ message: "Registration completed succefully!" });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}



const Login = async (req, res) => {
    try {
        const userMatch = await users.findOne({ email: req.body.email });
        if (userMatch) {
            if (await bcrypt.compare(req.body.password, userMatch.password)) {
                // generating access token & refresh token
                const accessToken = utils.generateAccessToken({ _id: userMatch._id, name: userMatch.name });
                const refreshToken = utils.generateRefreshToken({ _id: userMatch._id, name: userMatch.name });
                res.cookie("satoken", accessToken, cookiesOption.cookieOption1);
                res.cookie("sareftoken", refreshToken, cookiesOption.cookieOption2);
                
                // Storing refresh-token in database
                const matchTokenDb = await tokens.findOne({ id: userMatch._id });
                if (matchTokenDb) {
                    await tokens.findByIdAndRemove({ _id: matchTokenDb._id });
                }
                const tokenStatus = await new tokens({
                    id: userMatch._id,
                    refreshToken: refreshToken,
                }).save();

                if (!tokenStatus) {
                    throw new Error({ message: "Internal server error!" });
                } else {
                    res.status(200).send({ message: "Login successfully", loggedUser: userMatch.name });
                }
            } else {
                res.status(403).send({ message: "Invalid Creadentials!" });
            }
        } else {
            res.status(403).send({ message: "Invalid Creadentials!" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: "Internal Server Error!" });
    }
}


const getLogout = async (req, res) => {
    try {
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.clearCookie('satoken',undefined);
            res.clearCookie('sareftoken',undefined);
            await tokens.findOneAndRemove({ id: getLoggedData._id });
            res.status(200).send({ loggedUser: "undefined" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const getChangePassword = async (req, res) => {
    try {
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const changePassword = async (req, res) => {
    try {
        const DecodedToken = jwt.verify(req.cookies.satoken, process.env.ACCESS_SECRET_KEY);
        const user = await users.findOne({ _id: DecodedToken._id });
        const matchPassword = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!matchPassword) {
            return res.status(404).send({ message: "Please enter valid current password!" });
        }
        const encryptedPassword = await bcrypt.hash(req.body.newPassword, salt);
        if (!encryptedPassword) {
            return res.status(500).send({ message: "Internal server error" });
        }
        const updateStatus = await users.findByIdAndUpdate({ _id: DecodedToken._id }, { $set: { password: encryptedPassword } });
        if (!updateStatus) {
            return res.status(500).send({ message: "Internal server error" });
        }
        res.status(200).send({ message: "Password updated successfully!" })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}


const getResetPassword = async (req, res) => {
    try {
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const sendResetEmail = async (req, res) => {
    try {
        const userMatch = await users.findOne({ email: req.body.email });
        if (!userMatch) return res.status(404).send({ message: "Please provide valid email address" });
        
        // sending password reset link over email
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

        // generating a token to send in query which will be expired in next 5 minutes
        const token = jwt.sign({ _id: userMatch._id }, process.env.QUERY_TOKEN_SECRET_KEY, { expiresIn: 60 * 10 });
        
        // checking for existing token
        const existingToken = await queryTokens.findOne({ userId: userMatch._id });

        if (existingToken) {
            await queryTokens.findOneAndRemove({ userId: userMatch._id });
        }

        const savdedStatus = await new queryTokens({
            userId: userMatch._id,
            queryToken: token,
        }).save();

        if (!savdedStatus) {
            return res.status(500).send({ message: "Internal server error" });
        }

        const sendEmailStatus = await transporter.sendMail({
            from: `${process.env.email}`,
            to: `${userMatch.email}`,
            subject: "Reset Password",
            html: `<p>Hi ${userMatch.name}, <br><br>Have you requested to reset your password? Click here to <a href="https://www.skillascent.in/user/reset/password?id=${token}">Reset</a> your password.<br>If your are not then ignore this email.</p><br><br><span><strong>Note:</strong>This link will be expired in next 10 minutes.</span><br><br><br><h4>Thanks & Regards</h4><span>Team Skill Ascent</span>`
        });

        if (sendEmailStatus) {
            return res.status(200).send({ message: "Password reset link has been sent on your email...," });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const getSetNewPassword = async (req, res) => {
    try {
        // console.log(req.query.id);
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            const matchQueryToken = await queryTokens.findOne({ queryToken: req.query.id });
            if (!matchQueryToken) return res.status(404).send({ loggedUser: "undefined", message: "Bad request!" });
            const verifiedQueryToken = utils.verifyQueryToken(req.query.id, process.env.QUERY_TOKEN_SECRET_KEY);
            if (verifiedQueryToken === undefined) {
                return res.status(404).send({ loggedUser: "undefined", message: "This link has been expired!" });
            }
            return res.status(200).send({ loggedUser: "undefined" });
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            return res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" });
    }
}


const SetNewPassword = async (req, res) => {
    try {
        // console.log(req.query.id);
        const getLoggedData = await userAuth.userAuth(req, res);
        if (getLoggedData === undefined) {
            const matchQueryToken = await queryTokens.findOne({ queryToken: req.query.id });
            if (!matchQueryToken) return res.status(404).send({ loggedUser: "undefined", message: "Bad request!" });
            const verifiedQueryToken = utils.verifyQueryToken(req.query.id, process.env.QUERY_TOKEN_SECRET_KEY);
            if (verifiedQueryToken === undefined) {
                return res.status(404).send({ loggedUser: "undefined", message: "This link has been expired!" });
            }
            //  encrypting new password
            const encryptedNewPassword = await bcrypt.hash(req.body.newPassword, salt);
            await users.findByIdAndUpdate({_id:verifiedQueryToken._id},{$set:{password:encryptedNewPassword}});
            await queryTokens.findByIdAndRemove({_id:matchQueryToken._id});
            return res.status(200).send({ loggedUser: "undefined"});
        } else {
            res.cookie('satoken', getLoggedData.accessToken, cookiesOption.cookieOption1);
            res.cookie('sareftoken', getLoggedData.refreshToken, cookiesOption.cookieOption2);
            return res.status(200).send({ loggedUser: getLoggedData.loggedUser });
        }
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" });
    }
}

module.exports = {
    getRegister,
    getLogin,
    Register,
    Login,
    getLogout,
    getChangePassword,
    changePassword,
    getResetPassword,
    sendResetEmail,
    getSetNewPassword,
    SetNewPassword,
}