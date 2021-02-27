const mongoose = require('mongoose');

const watchListSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        max: 10
    },
    currency: {
        type: String,
        required: true,
        max: 4
    }
});

module.exports = mongoose.model('watchList', watchListSchema);