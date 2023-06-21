const express = require('express');
const router = express.Router();
const adminController  = require('../controllers/adminController');
const Authentication = require('../auth/adminAuth');
const middleware = require('../middleware/admin');

router.get('/auth/api',Authentication.AdminAuth);
router.post('/login/api',adminController.Login);
router.get('/dashboard/api',middleware.adminAuth,adminController.getDashboard);
router.get('/users/api',middleware.adminAuth,adminController.getUsers);
router.get('/courese-list/api',middleware.adminAuth,adminController.getCourseList);
router.get('/add-content/:courseName',middleware.adminAuth,adminController.getContentWrite);
router.get('/view-contents/:courseName',middleware.adminAuth,adminController.getContents);
router.get('/update-content/:courseName/:slug',middleware.adminAuth,adminController.getContentToUpdate);
router.post('/add-course/api',middleware.adminAuth,adminController.AddCourse);
router.post('/add-content/:courseName',middleware.adminAuth,adminController.WriteContent);
router.post('/update-content/:courseName/:slug',middleware.adminAuth,adminController.UpdateContent);
router.delete('/delete/course/:courseId',middleware.adminAuth,adminController.DeleteCourse);
router.delete('/delete/content/:courseName/:slug',middleware.adminAuth,adminController.DeleteContent);
router.get('/update/course-details/:courseId',middleware.adminAuth,adminController.getUpdateCourse);
router.post('/update/course-details/:courseId',middleware.adminAuth,adminController.UpdateCourse);
router.get('/queries/api',middleware.adminAuth,adminController.getQueries);
router.post('/query/reply/api',middleware.adminAuth,adminController.QueryReply);
router.get('/get/replies/:replyId',middleware.adminAuth,adminController.getReplies);
router.delete('/query/delete/:queryId',middleware.adminAuth,adminController.deleteQuery);
router.get('/site-settings/api',Authentication.AdminAuth);
router.get('/disclamer/api',middleware.adminAuth,adminController.getDisclamer);
router.get('/privacy-policy/api',middleware.adminAuth,adminController.getPrivacyPolicy);
router.post('/update/policy/api',middleware.adminAuth,adminController.setPrivacyPolicy);
router.post('/update/disclamer/api',middleware.adminAuth,adminController.setDisclamer);
router.post('/update/users/deatils/api',middleware.adminAuth,adminController.updateUsers);
router.delete('/user/delete/:userId/api',middleware.adminAuth,adminController.deleteUser);


module.exports = router;