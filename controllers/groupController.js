const Group = require('../models/group');
const Level = require('../models/level');
const Student = require('../models/student')
const Absent = require('../models/absent')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Group List 
exports.group_list = (req, res, next) => {
    Group.find()
        .sort([['name', 'ascending']])
        .exec(function (err, results) {
            if (err) { return next(err); }
            res.render('group_list', { title: 'All Groups', group_list: results });
        });
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

    body('name').trim().isLength({ min: 1 }).escape().withMessage('Group name is required.'),
    body('level_start_date').trim().isLength({ min: 1 }).escape().withMessage('The level start date is required.'),
    body('level_end_date').trim().isLength({ min: 1 }).escape().withMessage('The level end date is required.'),
    body('level_choose').trim().isLength({ min: 1 }).escape().withMessage('Choose the level is required.'),
    body('status').trim().isLength({ min: 1 }).escape().withMessage('Choose the status is required.'),

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
            res.redirect('/admin/level/group/' + req.params.id)
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
                _id: req.params.id,
            })

            Group.findByIdAndUpdate(req.params.id, group_new, (err, thegroup) => {
                if (err) { return next(err); }
                res.redirect('/admin/level/group/' + thegroup.url)
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
exports.group_new_meeting_post = (req, res, next) =>{
    if(req.body.student.length > 0){
        for(var i=0; req.body.student.length > i; i++){
            var absent = new Absent({
                level: req.body.student[i].level,
                student: req.body.student[i].unattended,
                reason: req.body.student[i].reason,
            })
            absent.save((err) =>{
                if (err) { return next(err); }
            })
            switch(req.body.student[i].level_name){
                case 'Level1':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level1: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
                case 'Level2':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level2: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
                case 'Level3':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level3: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
                case 'Level4':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level4: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
                case 'Level5':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level5: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
                case 'Level6':
                    Student.findByIdAndUpdate(req.body.student[i].unattended, { $inc: { level6: 1 }})
                    .exec(err =>{
                        if (err) { return next(err); }
                    })
                    break;
            }
            
        }
        Group.findByIdAndUpdate(req.params.id, { $inc: { lecture_attended: 1 }}).exec((err) =>{
            if (err) { return next(err); }
        })
        res.redirect('/admin/level/group/' + req.params.id)
    }
    else{
        res.redirect('/admin/level/group/' + req.params.id)
    }
    
}

/***************************************************************************************/
