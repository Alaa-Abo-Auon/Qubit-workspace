var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AbsentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
    reason: { type: Boolean, default: false }
})



module.exports = mongoose.model('Absent', AbsentSchema);