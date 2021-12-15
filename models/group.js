var mongoose = require('mongoose');
const { DateTime } = require("luxon");
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name:  { type: String, required: true , maxlength: 100 },
    current_level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
    batch: { type:String },
    level_start_date: { type: Date },
    level_end_date: { type: Date },
    lecture_attended: { type: Number, default: 0 },
    lecture_time: [{ type: Object }],
    status: { type: String },
});

GroupSchema
.virtual('short_level_start_date')
.get(function () {
  return DateTime.fromJSDate(this.level_start_date).toLocaleString(DateTime.DATE_MED);
});

GroupSchema
.virtual('short_level_end_date')
.get(function () {
  return DateTime.fromJSDate(this.level_end_date).toLocaleString(DateTime.DATE_MED);
});

GroupSchema
.virtual('url')
.get(function () {
  return this._id;
});


module.exports = mongoose.model('Group', GroupSchema);