const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: String,
    effect: String,
    type: String,
    num: Number
})

const SkillModel = mongoose.model('skills', skillSchema);
module.exports = SkillModel;