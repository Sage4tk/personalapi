const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        max: 10
    },
    bought: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        max: 4
    }
});

module.exports = mongoose.model('Bought', investmentSchema);