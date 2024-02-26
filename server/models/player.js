const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: String,
    password: String,
    status: Object,
    personality: Array,
    stats: Object,
    attacks: Array,
    skills: Array,
    inventory: Array,
    progress: Object,
})

const PlayerModel = mongoose.model('players', playerSchema);

module.exports = PlayerModel;