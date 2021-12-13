var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AbsentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    level1: [{ type: String }],
    level2: [{ type: String }],
    level3: [{ type: String }],
    level4: [{ type: String }],
})



module.exports = mongoose.model('Absent', AbsentSchema);