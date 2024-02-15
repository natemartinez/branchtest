const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    effect: String,
    name: String,
    num: Number,
    rarity: String,
    type: String,
    img: String
})

const ItemsModel = mongoose.model('items', itemSchema);

module.exports = ItemsModel;