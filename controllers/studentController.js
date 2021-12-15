const Student = require('../models/student');
const Group = require('../models/group')
const Level = require('../models/level');
const Absent = require('../models/absent');
const async = require('async');
const { body, validationResult } = require('express-validator');


// Student List 
exports.student_list = (req, res, next) => {
    Student.find()
        .sort([['name', 'ascending']])
        .exec(function (err, results) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('student_list', { title: 'All Students', student_list: results });
        });
}

/***************************************************************************************/

// GET Create New Student
exports.student_create_get = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.find()
                .sort([['name', 'ascending']])
                .exec(cb)
        },
        level: (cb) => {
            Level.find()
                .sort([['name', 'ascending']])
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('student_form', { title: 'Register a new student', groups: results.group, levels: results.level });
    })
};

// POST Create New Student
exports.student_create_post = [

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Student name is required.'),
    body('phone_number').trim().isLength({ min: 1 }).escape().withMessage('Student phone number is required.'),
    body('group_choose').trim().isLength({ min: 1 }).escape().withMessage('Choose the group is required.'),
    body('level_choose').trim().isLength({ min: 1 }).escape().withMessage('Choose the group is required.'),
    body('enroll_date').trim().isLength({ min: 1 }).escape().withMessage('Enroll date is required.'),
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Choose the status is required.'),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            async.parallel({
                group: (cb) => {
                    Group.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                },
                level: (cb) => {
                    Level.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                res.render('student_form', { title: 'Register a new student', student: req.body, groups: results.group, levels: results.level, errors: errors.array() });
            })
            return
        } else {
            async.parallel({
                student: (cb) => {
                    Student.findOne({ name: req.body.name })
                        .exec(cb)
                },
                group: (cb) => {
                    Group.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                },
                level: (cb) => {
                    Level.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                },
                chosen_level: (cb) => {
                    Level.findById(req.body.level_choose)
                        .exec(cb)
                },
                chosen_group: (cb) => {
                    Group.findById(req.body.group_choose)
                        .populate('current_level')
                        .exec(cb)
                },
            }, (err, results) => {
                if (err) { return next(err); }
                if (results.student) {
                    const Err = 'The name "' + results.student.name + '" is not available'
                    res.render('student_form', { title: 'Register a new student', student: req.body, groups: results.group, levels: results.level, err: Err });
                } else {
                    var chosen_level = results.chosen_level.name
                    var chosen_group = results.chosen_group.current_level.name
                    if (chosen_level == chosen_group) {
                        var student = new Student({
                            name: req.body.name,
                            phone_number: req.body.phone_number,
                            enroll_date: req.body.enroll_date,
                            group: req.body.group_choose,
                            status: req.body.status,
                            current_level: req.body.level_choose,
                        });
                        student.save((err, result) => {
                            if (err) { return next(err); }
                            console.log(result._id);
                            const absent = new Absent({
                                student: result._id
                            })
                            absent.save((err) => {
                                if (err) { return next(err); }
                            })
                            res.redirect('/admin/students');
                        })
                    } else {
                        async.parallel({
                            level: (cb) => {
                                Level.find()
                                    .sort([['name', 'ascending']])
                                    .exec(cb)
                            },
                            group: (cb) => {
                                Group.find()
                                    .sort([['name', 'ascending']])
                                    .exec(cb)
                            },
                        }, (err, results) => {
                            if (err) { return next(err); }
                            const Err = 'The group you chose is not in the level "' + chosen_level + '"'
                            res.render('student_form', { title: 'Register a new student', student: req.body, groups: results.group, levels: results.level, err: Err });
                        })
                    }

                }
            })
        };
    },

];

/***************************************************************************************/

// Student Detail
exports.student_detail_get = (req, res, next) => {
    Student.findById(req.params.id)
        .populate({
            path: 'group',
            populate: { path: 'current_level' },
        })
        .exec((err, results) => {
            if (err) { return next(err); }
            res.render('student_detail', { title: 'Student Information', student_detail: results })
        })
}

/***************************************************************************************/

// GET Student Delete
exports.student_delete_get = (req, res, next) => {
    Student.findById(req.params.id)
        .exec((err, results) => {
            if (err) { return next(err); }
            res.render('student_delete', { title: 'Delete', student: results })
        })
}
// POST Student Delete
exports.student_delete_post = (req, res, next) => {
    async.parallel({
        student: (cb) => {
            Student.findById(req.params.id)
                .exec(cb)
        },
        absent: (cb) => {
            Absent.findById(req.params.id)
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.student.length > 0) {
            res.render('student_delete', { title: 'Delete', student: results })
        }
        else {
            Student.findByIdAndRemove(req.body.delete, (err) => {
                if (err) { return next(err); }
                Absent.findOneAndRemove(req.body.delete, (err) => {
                    if (err) { return next(err); }
                    res.redirect('/admin/students')
                })
            })
        }
    })
}

/***************************************************************************************/

// GET Student Update
exports.student_update_get = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.find()
                .sort([['name', 'ascending']])
                .exec(cb)
        },
        student: (cb) => {
            Student.findById(req.params.id)
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('student_form', { title: 'Update Student', groups: results.group, student: results.student })
    })
}
// POST Student Update
exports.student_update_post = [

    body('name').trim().isLength({ min: 1 }).escape().withMessage('Student name is required.'),
    body('phone_number').trim().isLength({ min: 1 }).escape().withMessage('Student phone number is required.'),
    body('group_choose').trim().isLength({ min: 1 }).escape().withMessage('Choose the group is required.'),
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Choose the status is required.'),

    (req, res, next) => {

        const errors = validationResult(req);

        var student_new = new Student({
            name: req.body.name,
            phone_number: req.body.phone_number,
            group: req.body.group_choose,
            status: req.body.status,
            enroll_date: (req.body.enroll_date == '') ? Date.now : req.body.enroll_date,
            _id: req.params.id,
        })

        if (!errors.isEmpty()) {
            async.parallel({
                group: (cb) => {
                    Group.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                },
                student: (cb) => {
                    Student.findById(req.params.id)
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                res.render('student_form', { title: 'Update Student', groups: results.group, student: results.student, errors: errors.array() })
            })
            return;
        }
        else {
            Student.findByIdAndUpdate(req.params.id, student_new, {}, (err, result) => {
                if (err) { return next(err); }
                res.redirect('/admin/level/group/student/' + result.url)
            })
        }
    }
];

/***************************************************************************************/
// Absent Students
exports.students_absent_list_get = (req, res, next) => {
    async.parallel({
        student: (cb) => {
            Student.find()
                .populate('current_level')
                .exec(cb)
        },
        absent: (cb) => {
            Absent.find({ level1: { $gte: 2 } })
        },
    }, (err, results) => {
        if (err) { return next(err); }

    })
    res.render('student_absent', { title: 'Absent students', });
}
