const mongoose = require('mongoose');

const enemySchema = new mongoose.Schema({
    name: String,
    status: Object,
    stats: Object,
    personality: String,
})

const EnemyModel = mongoose.model('enemies', enemySchema);

module.exports = EnemyModel;