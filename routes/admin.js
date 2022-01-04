var express = require('express');
var router = express.Router();
var level_controller = require('../controllers/levelController');
var group_controller = require('../controllers/groupController');
var student_controller = require('../controllers/studentController');

// GET Home page (detail all of info)
router.get('/', (req, res, next) =>{
    res.redirect('/admin/levels')
});

/***************************************************************************************/
/* LEVEL ROUTES */
// GET Level list
router.get('/levels', level_controller.level_list);

// GET,POST Create New Level
router.get('/level/create', level_controller.level_create_get);
router.post('/level/create', level_controller.level_create_post);

// GET Level detail
router.get('/level/:id', level_controller.level_detail);

// GET,POST Level delete
router.get('/level/:id/delete', level_controller.level_delete_get);
router.post('/level/:id/delete', level_controller.level_delete_post);

// GET,POST Level update
router.get('/level/:id/update', level_controller.level_update_get);
router.post('/level/:id/update', level_controller.level_update_post);


/***************************************************************************************/
/* GROUP ROUTES */
// GET Group list
router.get('/groups', group_controller.group_list);

// GET Group detail
router.get('/level/group/:id', group_controller.group_detail);

// GET,POST Create New group
router.get('/group/create', group_controller.group_create_get);
router.post('/group/create', group_controller.group_create_post);

// GET,POST delete group
router.get('/level/group/:id/delete', group_controller.group_delete_get);
router.post('/level/group/:id/delete', group_controller.group_delete_post);

// GET,POST update group
router.get('/level/group/:id/update', group_controller.group_update_get);
router.post('/level/group/:id/update', group_controller.group_update_post);

// GET,POST new lecture
router.get('/level/group/:id/new_meeting', group_controller.group_new_meeting_get);
router.post('/level/group/:id/new_meeting', group_controller.group_new_meeting_post);

// Next level
router.post('/level/group/:id', group_controller.next_level_post);

// Calender 
router.get('/calendar', group_controller.calendar);

/***************************************************************************************/
/* STUDENT ROUTES */
// GET Student list
router.get('/students', student_controller.student_list);

// GET,POST Create New student
router.get('/student/create', student_controller.student_create_get);
router.post('/student/create', student_controller.student_create_post);

// GET Student detail
router.get('/level/group/student/:id', student_controller.student_detail_get);

// GET,POST Student delete
router.get('/level/group/student/:id/delete', student_controller.student_delete_get);
router.post('/level/group/student/:id/delete', student_controller.student_delete_post);

// GET,POST Student delete
router.get('/level/group/student/:id/update', student_controller.student_update_get);
router.post('/level/group/student/:id/update', student_controller.student_update_post);

// Absent Student
router.get('/students/absent', student_controller.student_absent_list_get);

/***************************************************************************************/


module.exports = router;