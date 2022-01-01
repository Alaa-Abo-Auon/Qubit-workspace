var mongoose = require('mongoose');
const { DateTime } = require("luxon");
var Schema = mongoose.Schema;


var StudentSchema = new Schema({
  current_level: { type: Schema.Types.ObjectId, ref: 'Level' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  name: { type: String, required: true, maxLength: 100 },
  phone_number: { type: String, required: true },
  enroll_date: { type: Date },
  status: { type: String },
  level1: {type: Number, default: 0 },
  level2: {type: Number, default: 0 },
  level3: {type: Number, default: 0 },
  level4: {type: Number, default: 0 },
  level5: {type: Number, default: 0 },
  level6: {type: Number, default: 0 },
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