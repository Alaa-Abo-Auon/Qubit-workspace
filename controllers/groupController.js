const Group = require('../models/group');
const Level = require('../models/level');
const Student = require('../models/student')
const Absent = require('../models/absent')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Group List 
exports.group_list = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.find()
                .populate('current_level')
                .sort([['name', 'ascending']])
                .exec(cb)
        }
    }, (err, result) => {
        if (err) { return next(err); }
        res.render('group_list', { title: 'All Groups', group_list: result.group });
    })
}

/***************************************************************************************/

// GET Create New Group
exports.group_create_get = (req, res, next) => {
    async.parallel({
        level: (cb) => {
            Level.find()
                .sort([['name', 'ascending']])
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('group_form', { title: 'Create new group', levels: results.level });
    })
}

// POST Create New Group
exports.group_create_post = [

    body('name').trim().isLength({ min: 1 }).withMessage('Group name is required.'),
    body('level_start_date').trim().isLength({ min: 1 }).withMessage('The level start date is required.'),
    body('level_end_date').trim().isLength({ min: 1 }).withMessage('The level end date is required.'),
    body('level_choose').trim().isLength({ min: 1 }).withMessage('Choose the level is required.'),
    body('status').trim().isLength({ min: 1 }).withMessage('Choose the status is required.'),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            async.parallel({
                level: (cb) => {
                    Level.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                res.render('group_form', { title: 'Create new group', group: req.body, levels: results.level, errors: errors.array() });
            });
            return;
        }
        else {
            async.parallel({
                group: (cb) => {
                    Group.findOne({ name: req.body.name })
                        .exec(cb)
                },
                level: (cb) => {
                    Level.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                const Err = 'The name "' + req.body.name + '" is not available'
                if (results.group) {
                    res.render('group_form', { title: 'Create new group', group: req.body, levels: results.level, err: Err });
                } else {
                    var lecture_time = [
                        { saturday: req.body.saturday },
                        { sunday: req.body.sunday },
                        { monday: req.body.monday },
                        { tuesday: req.body.tuesday },
                        { wednesday: req.body.wednesday },
                        { thursday: req.body.thursday },
                    ];

                    var group = new Group({
                        name: req.body.name,
                        level_end_date: req.body.level_end_date,
                        level_start_date: req.body.level_start_date,
                        current_level: req.body.level_choose,
                        lecture_time: lecture_time,
                        status: req.body.status,
                    });

                    group.save((err) => {
                        if (err) { return next(err); }
                        res.redirect('/admin/groups');
                    });
                }
            })
        }

    }
];

/***************************************************************************************/

// Group Detail
exports.group_detail = (req, res, next) => {
    async.parallel({
        students: (cb) => {
            Student.find({ 'group': req.params.id })
                .populate('group')
                .exec(cb)
        },
        group: (cb) => {
            Group.findById(req.params.id)
                .populate('current_level')
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        var name = results.group.current_level.name;
        Level.find()
            .exec((err, next_level) => {
                if (err) { return next(err); }
                var index = next_level.findIndex(i => i.name === name)
                var c = index + 1
                res.render('group_detail', { title: 'Group Detail', students: results.students, group: results.group, next_level: next_level[c] })
            })

    })
}

// Next level
exports.next_level_post = (req, res, next) => {
    Group.findByIdAndUpdate(req.params.id, { current_level: req.body.next_level })
        .exec((err) => {
            if (err) { return next(err); }
            Student.update({ group: req.params.id }, { current_level: req.body.next_level }, { multi: true }, (err) => {
                if (err) { return next(err); }
                res.redirect('/admin/level/group/' + req.params.id)
            })
        })
}

/***************************************************************************************/

// GET Group Delete
exports.group_delete_get = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.findById(req.params.id).exec(cb)
        },
        student: (cb) => {
            Student.find({ 'group': req.params.id }).exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('group_delete', { title: 'Delete', groups: results.group, students: results.student })
    })
}
// POST Group Delete
exports.group_delete_post = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.findById(req.params.id).exec(cb)
        },
        student: (cb) => {
            Student.find({ 'group': req.params.id }).exec(cb)
        },
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.student.length > 0) {
            res.render('group_delete', { title: 'Delete', groups: results.group, students: results.student })
            return;
        } else {
            Group.findByIdAndRemove(req.body.delete, (err) => {
                if (err) { return next(err); }
                res.redirect('/admin/groups');
            })
        }
    })
}

/***************************************************************************************/

// GET Group Update
exports.group_update_get = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.findById(req.params.id)
                .exec(cb)
        },
        level: (cb) => {
            Level.find()
                .sort([['name', 'ascending']])
                .exec(cb)
        }
    }, (err, results) => {

        if (err) { return next(err); }
        res.render('group_form', { title: 'Update Group', group: results.group, levels: results.level })
    })
}
// POST Group Update
exports.group_update_post = [

    body('name').trim().isLength({ min: 1 }).withMessage('Group name is required.'),
    body('level_start_date').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('The level start date is required.'),
    body('level_end_date').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('The level end date is required.'),
    body('level_choose').trim().isLength({ min: 1 }).withMessage('The level is required.'),
    body('status').trim().isLength({ min: 1 }).withMessage('Choose the status is required.'),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            async.parallel({
                group: (cb) => {
                    Group.findById(req.params.id)
                        .exec(cb)
                },
                level: (cb) => {
                    Level.find()
                        .sort([['name', 'ascending']])
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                res.render('group_form', { title: 'Update Group', group: results.group, levels: results.level, errors: errors.array() })
            })
            return;
        }
        else {
            var lecture_time = [
                { saturday: req.body.saturday },
                { sunday: req.body.sunday },
                { monday: req.body.monday },
                { tuesday: req.body.tuesday },
                { wednesday: req.body.wednesday },
                { thursday: req.body.thursday },
            ];

            var group_new = new Group({
                name: req.body.name,
                level_start_date: (req.body.level_start_date == '') ? Date.now : req.body.level_start_date,
                level_end_date: (req.body.level_end_date == '') ? Date.now : req.body.level_end_date,
                current_level: req.body.level_choose,
                lecture_time: lecture_time,
                status: req.body.status,
                lecture_attended: req.body.lecture_attended,
                _id: req.params.id,
            })

            Group.findByIdAndUpdate(req.params.id, group_new, (err, the_group) => {
                if (err) { return next(err); }
                Student.update({ group: req.params.id }, { current_level: req.body.level_choose }, { multi: true }, (err) => {
                    if (err) { return next(err); }
                    res.redirect('/admin/level/group/' + the_group.url)
                })
            })
        }
    }
];

/***************************************************************************************/

// GET Add New Meeting
exports.group_new_meeting_get = (req, res, next) => {
    async.parallel({
        group: (cb) => {
            Group.findById(req.params.id)
                .populate('current_level')
                .exec(cb)
        },
        students: (cb) => {
            Student.find({ 'group': req.params.id })
                .populate('group')
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('new_meeting', { title: 'New meeting', group: results.group, students: results.students })
    })
}
// POST Add New Meeting
exports.group_new_meeting_post = (req, res, next) => {
    if (req.body.student.length > 0) {
        for (var i = 0; req.body.student.length > i; i++) {
            var absent = new Absent({
                level: req.body.student[i].level,
                student: req.body.student[i].unattended,
                reason: req.body.student[i].reason,
            })
            absent.save((err) => {
                if (err) { return next(err); }
            })
            switch (req.body.student[i].level_name) {
                case 'Level1':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level1: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
                case 'Level2':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level2: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
                case 'Level3':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level3: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
                case 'Level4':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level4: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
                case 'Level5':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level5: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
                case 'Level6':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level6: 1 } })
                        .exec(err => {
                            if (err) { return next(err); }
                        })
                    break;
            }

        }
        res.redirect('/admin/level/group/' + req.params.id)
    }
    else {
        res.redirect('/admin/level/group/' + req.params.id)
    }
    Group.findByIdAndUpdate(req.params.id, { $inc: { lecture_attended: 1 } }).exec((err) => {
        if (err) { return next(err); }
    })
}

/***************************************************************************************/

exports.calendar = (req, res, next) => {

    async.parallel({
        groups: (cb) => {
            Group.find({})
                .exec(cb)
        }
    }, (err, result) => {
        if (err) { return next(err); }
        var time = {}
        for (var group of result.groups) {
            for (var t of group.lecture_time) {
                if (t.saturday) {
                    var check = t.saturday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.sat1 = group.name
                            break
                        case '2':
                            time.sat2 = group.name
                            break
                        case '3':
                            time.sat3 = group.name
                            break
                        case '4':
                            time.sat4 = group.name
                            break
                        case '9':
                            time.sat9 = group.name
                            break
                        case '10':
                            time.sat10 = group.name
                            break
                        case '11':
                            time.sat11 = group.name
                            break
                        case '12':
                            time.sat12 = group.name
                            break
                    }
                }
                if (t.sunday) {
                    var check = t.sunday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.sun1 = group.name
                            break
                        case '2':
                            time.sun2 = group.name
                            break
                        case '3':
                            time.sun3 = group.name
                            break
                        case '4':
                            time.sun4 = group.name
                            break
                        case '9':
                            time.sun9 = group.name
                            break
                        case '10':
                            time.sun10 = group.name
                            break
                        case '11':
                            time.sun11 = group.name
                            break
                        case '12':
                            time.sun12 = group.name
                            break
                    }
                }
                if (t.monday) {
                    var check = t.monday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.mon1 = group.name
                            break
                        case '2':
                            time.mon2 = group.name
                            break
                        case '3':
                            time.mon3 = group.name
                            break
                        case '4':
                            time.mon4 = group.name
                            break
                        case '9':
                            time.mon9 = group.name
                            break
                        case '10':
                            time.mon10 = group.name
                            break
                        case '11':
                            time.mon11 = group.name
                            break
                        case '12':
                            time.mon12 = group.name
                            break
                    }
                }
                if (t.tuesday) {
                    var check = t.tuesday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.tue1 = group.name
                            break
                        case '2':
                            time.tue2 = group.name
                            break
                        case '3':
                            time.tue3 = group.name
                            break
                        case '4':
                            time.tue4 = group.name
                            break
                        case '9':
                            time.tue9 = group.name
                            break
                        case '10':
                            time.tue10 = group.name
                            break
                        case '11':
                            time.tue11 = group.name
                            break
                        case '12':
                            time.tue12 = group.name
                            break
                    }
                }
                if (t.wednesday) {
                    var check = t.wednesday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.wed1 = group.name
                            break
                        case '2':
                            time.wed2 = group.name
                            break
                        case '3':
                            time.wed3 = group.name
                            break
                        case '4':
                            time.wed4 = group.name
                            break
                        case '9':
                            time.wed9 = group.name
                            break
                        case '10':
                            time.wed10 = group.name
                            break
                        case '11':
                            time.wed11 = group.name
                            break
                        case '12':
                            time.wed12 = group.name
                            break
                    }
                }
                if (t.thursday) {
                    var check = t.thursday.match(/\d*/);
                    switch (check[0]) {
                        case '1':
                            time.thu1 = group.name
                            break
                        case '2':
                            time.thu2 = group.name
                            break
                        case '3':
                            time.thu3 = group.name
                            break
                        case '4':
                            time.thu4 = group.name
                            break
                        case '9':
                            time.thu9 = group.name
                            break
                        case '10':
                            time.thu10 = group.name
                            break
                        case '11':
                            time.thu11 = group.name
                            break
                        case '12':
                            time.thu12 = group.name
                            break
                    }
                }
            }
        }
        res.render('calendar', { time: time })
    })
}

/***************************************************************************************/
