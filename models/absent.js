var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AbsentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    level1: { type: Number, default: 0 },
    level2: { type: Number, default: 0 },
    level3: { type: Number, default: 0 },
    level4: { type: Number, default: 0 },
})



module.exports = mongoose.model('Absent', AbsentSchema);