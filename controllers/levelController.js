const Level = require('../models/level');
const Group = require('../models/group');
const Student = require('../models/student');
const async = require('async');
const { body, validationResult } = require('express-validator');


// Home Page
exports.index = (req, res, next) => {
    async.parallel({
        level_count: (cb) => {
            Level.countDocuments({}, cb);
        },
        group_count: (cb) => {
            Group.countDocuments({}, cb);
        },
        student_count: (cb) => {
            Student.countDocuments({}, cb);
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('index', { title: 'All Information', level_count: results.level_count, group_count: results.group_count, student_count: results.student_count })
    })
}

/***************************************************************************************/

// Level List 
exports.level_list = (req, res, next) => {
    Level.find()
        .sort([['name', 'ascending']])
        .exec(function (err, results) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('level_list', { title: 'Home', level_list: results });
        });
}

/***************************************************************************************/

// Level Detail
exports.level_detail = (req, res, next) => {
    async.parallel({
        level: (cb) => {
            Level.findById(req.params.id)
                .exec(cb)
        },
        group: (cb) => {
            Group.find({ 'current_level': req.params.id })
                .populate('current_level')
                .exec(cb)
        },
    }, (err, results) =>{
        if (err) { return next(err); }
        res.render('level_detail', { title: 'Level Detail', level_groups: results.group, level: results.level });
    });

};

/***************************************************************************************/

// GET Create New Level
exports.level_create_get = (req, res, next) => {
    res.render('level_form', { title: 'Create new level' });
}

// POST Create New Level
exports.level_create_post = [

    
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Level name is required.'),
    body('total_days').trim().isLength({ min: 1 }).escape().withMessage('Total days is required.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description is required.'),
    body('type').trim().isLength({ min: 1 }).escape().withMessage('Level type is required.'),

    
    (req, res, next) => {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('level_form', { title: 'Create new level', level: req.body, errors: errors.array() });
            return;
        }
        else {
            
            var level = new Level({
                name: req.body.name,
                total_days: req.body.total_days,
                description: req.body.description,
                type: req.body.type,
            });
            level.save((err) => {
                if (err) { return next(err); }
                res.redirect('/admin/levels');
            })
        }

    }
];

/***************************************************************************************/

// GET Level Update
exports.level_update_get = (req, res, next) => {
    async.parallel({
        level: (cb) => {
            Level.findById(req.params.id)
                .exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('level_form', { title: 'Update Level', level: results.level })
    })
}
// POST Level Update
exports.level_update_post = [
    
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Level name must not be empty.'),
    body('total_days').trim().isLength({ min: 1 }).escape().withMessage('Total days must not be empty.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('description must not be empty.'),

    (req, res, next) => {

        const errors = validationResult(req);

        var level_new = new Level(
            {
                name: req.body.name,
                total_days: req.body.total_days,
                description: req.body.description,
                _id: req.params.id,
            }
        );

        if (!errors.isEmpty()) {
            async.parallel({
                level: (cb) => {
                    Level.findById(req.params.id)
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return next(err); }
                res.render('level_form', { title: 'Update Level', level: results.level, errors: errors.array() })
            });
            return;
        }
        else {
            Level.findByIdAndUpdate(req.params.id, level_new, (err, thelevel) => {
                if (err) { return next(err); }
                res.redirect('/admin' + thelevel.url)
            })
        }
    }
];

/***************************************************************************************/

// GET Level Delete
exports.level_delete_get = (req, res, next) => {
    async.parallel({
        level: (cb) => {
            Level.findById(req.params.id).exec(cb)
        },
        group: (cb) => {
            Group.find({ 'current_level': req.params.id }).exec(cb)
        }
    }, (err, results) => {
        if (err) { return next(err); }
        res.render('level_delete', { title: 'Delete Level', level: results.level, group: results.group });
    })
};
// POST Level Delete
exports.level_delete_post = (req, res, next) => {
    async.parallel({
        level: (cb) => {
            Level.findById(req.params.id).exec(cb)
        },
        group: (cb) => {
            Group.find({ 'current_level': req.params.id }).exec(cb)
        },
    }, (err, results) => {
        if (err) { return next(err); }
        if (results.group.length > 0) {
            res.render('level_delete', { title: 'Delete Level', level: results.level, group: results.group })
            return;
        } else {
            Level.findByIdAndRemove(req.body.del, (err) => {
                if (err) { return next(err); }
                res.redirect('/admin');
            })
        }
    })
}

/***************************************************************************************/
