const Group = require('../models/group');
const Level = require('../models/level');
const Student = require('../models/student')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Group list 
exports.group_list = (req, res, next) => {
    Group.find()
        .sort([['name', 'ascending']])
        .exec(function (err, results) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('group_list', { title: 'All Groups', group_list: results });
        });
}

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

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Group name is required.'),
    body('level_start_date').trim().isLength({ min: 1 }).escape().withMessage('The level start date is required.'),
    body('level_end_date').trim().isLength({ min: 1 }).escape().withMessage('The level end date is required.'),
    body('level_choose').trim().isLength({ min: 1 }).escape().withMessage('Choose the level is required.'),
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Choose the status is required.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
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
                const Err = 'The name is not available'
                if (results.group) {
                    res.render('group_form', { title: 'Create new group', group: req.body, levels: results.level, err:Err });
                } else {
                    var lecture_time = []
                    if(req.body.saturday){
                        var saturday = 'Saturday: ' + req.body.saturday;
                        lecture_time.push(saturday)
                    }
                    if(req.body.sunday){
                        var sunday = 'Sunday: ' + req.body.sunday;
                        lecture_time.push(sunday)
                    }
                    if(req.body.monday){
                        var monday = 'Monday: ' + req.body.monday;
                        lecture_time.push(monday)
                    }
                    if(req.body.tuesday){
                        var tuesday = 'Tuesday: ' + req.body.tuesday;
                        lecture_time.push(tuesday)
                    }
                    if(req.body.wednesday){
                        var wednesday = 'Wednesday: ' + req.body.wednesday;
                        lecture_time.push(wednesday)
                    }
                    if(req.body.thursday){
                        var thursday = 'Thursday: ' + req.body.thursday;
                        lecture_time.push(thursday)
                    }

                    // Create new group
                    var group = new Group({
                        name: req.body.name,
                        level_end_date: req.body.level_end_date,
                        level_start_date: req.body.level_start_date,
                        current_level: req.body.level_choose,
                        lecture_time: lecture_time,
                        status: req.body.status,
                    });
                    group.save((err, results) => {
                        if (err) { return next(err); }
                        
                        res.redirect('/admin/groups');
                    })
                }
            })
        }

    }
];

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
        var list = []
        for (var value of results.students) {
            list.push(value)
        }
        if (err) { return next(err); }
        res.render('group_detail', { title: 'Group Detail', students: list, group: results.group })
    })
}

// Delete Group
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
            Group.findByIdAndRemove(req.body.delg, (err) => {
                if (err) { return next(err); }
                res.redirect('/admin/groups');
            })
        }
    })
}

// Update Group
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

exports.group_update_post = [

    body('name').trim().isLength({ min: 1 }).escape().withMessage('Group name is required.'),
    body('level_start_date').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape().withMessage('The level start date is required.'),
    body('level_end_date').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).escape().withMessage('The level end date is required.'),
    body('level_choose').trim().isLength({ min: 1 }).escape().withMessage('The level is required.'),
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Choose the status is required.'),

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

            var lecture_time = []
                    if(req.body.saturday){
                        var saturday = 'Saturday: ' + req.body.saturday;
                        lecture_time.push(saturday)
                    }
                    if(req.body.sunday){
                        var sunday = 'Sunday: ' + req.body.sunday;
                        lecture_time.push(sunday)
                    }
                    if(req.body.monday){
                        var monday = 'Monday: ' + req.body.monday;
                        lecture_time.push(monday)
                    }
                    if(req.body.tuesday){
                        var tuesday = 'Tuesday: ' + req.body.tuesday;
                        lecture_time.push(tuesday)
                    }
                    if(req.body.wednesday){
                        var wednesday = 'Wednesday: ' + req.body.wednesday;
                        lecture_time.push(wednesday)
                    }
                    if(req.body.thursday){
                        var thursday = 'Thursday: ' + req.body.thursday;
                        lecture_time.push(thursday)
                    }
                    var group_new = new Group({
                        name: req.body.name,
                        level_start_date: (req.body.level_start_date == '') ? Date.now : req.body.level_start_date,
                        level_end_date: (req.body.level_end_date == '') ? Date.now : req.body.level_end_date,
                        current_level: req.body.level_choose,
                        lecture_time: lecture_time,
                        status: req.body.status,
                        _id: req.params.id,
                    })
            Group.findByIdAndUpdate(req.params.id, group_new, {}, (err, thegroup) => {
                if (err) { return next(err); }
                res.redirect('/admin/level/group/' + thegroup.url)
            })
        }
    }
];

exports.group_new_lecture_get = (req, res, next) =>{
    async.parallel({
        group: (cb) =>{
            Group.findById(req.params.id)
            .populate('current_level')
            .exec(cb)
        },
        students: (cb) => {
            Student.find({ 'group': req.params.id })
                .populate('group')
                .exec(cb)
        }
    }, (err, results) =>{
        var list2 = []
        for (var value of results.students) {
            list2.push(value)
        }
        if(err) { return next(err); }
        res.render('new_lecture', { title: 'New lecture', group: results.group, students: list2 })
    })
}
exports.group_new_lecture_post = (req, res, next) =>{
    res.send('not yet!');
}