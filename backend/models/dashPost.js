const mongoose = require('mongoose');

const dashPostSchema = mongoose.Schema({
    imagePath: { type: Array, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
});

module.exports = mongoose.model("dashpost", dashPostSchema);