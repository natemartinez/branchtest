const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: String,
    type: String,
    level:Number,
    baseDMG:Number,
})

const SkillModel = mongoose.model('Skill', skillSchema);

module.exports = SkillModel;