const mongoose = require('mongoose');

const attackSchema = new mongoose.Schema({
    name: String,
    type: String,
    level:Number,
    baseDMG:Number,
})

const AttackModel = mongoose.model('attacks', attackSchema);
module.exports = AttackModel;