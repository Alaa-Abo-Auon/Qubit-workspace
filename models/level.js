var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LevelSchema = new Schema({
    name:  { type: String, required: true },
    description: { type: String, required: true },
    total_days: { type: String },
});

LevelSchema
.virtual('url')
.get(function () {
  return this._id;
});

module.exports = mongoose.model('Level', LevelSchema);