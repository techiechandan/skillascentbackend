const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');


router.get('/home/api',appController.getHome);
router.get('/about/api',appController.getAbout);
router.get('/contact/api',appController.getContact);
router.get('/courses/api',appController.getCourses);
router.get('/learn/:courseName',appController.getContents);
router.get('/learn/:courseName/:topicName',appController.getContent);
router.post('/query/api',appController.SetQuery);
router.get('/disclamer/api',appController.getDisclamer);
router.get('/privacy-policy/api',appController.getPrivacyPolicy);

module.exports = router;