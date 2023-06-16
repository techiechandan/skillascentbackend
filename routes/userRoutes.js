const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/register/api',userController.getRegister);
router.get('/login/api',userController.getLogin);
router.get('/logout/api',userController.getLogout);
router.post('/register/api',userController.Register);
router.post('/login/api',userController.Login);
router.get('/change-password/api',userController.getChangePassword);
router.post('/change-password/api',userController.changePassword);
router.get('/reset-password/api',userController.getResetPassword);
router.post('/reset-password/api',userController.sendResetEmail);
router.get('/reset/password',userController.getSetNewPassword);
router.post('/reset/password',userController.SetNewPassword);

module.exports = router;