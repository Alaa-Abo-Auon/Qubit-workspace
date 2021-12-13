var mongoose = require('mongoose');
const { DateTime } = require("luxon");
var Schema = mongoose.Schema;


var StudentSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    phone_number: [{ type: String, required: true }],
    enroll_date: { type: Date },
    group: { type:Schema.Types.ObjectId, ref:'Group' },
    current_level: { type: Schema.Types.ObjectId, ref: 'Level'},
    attended_day: [{ type: String }],
    status: { type: String },
});

StudentSchema
.virtual('url')
.get(function () {
  return this._id;
});

StudentSchema
.virtual('due_back_formatted')
.get(function () {
  return DateTime.fromJSDate(this.enroll_date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Student', StudentSchema)