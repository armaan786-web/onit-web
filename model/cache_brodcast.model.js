const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus } = require('../common/const')


const broadCastCacheSchemma = mongoose.Schema({
    primary_services: {
        type: mongoose.Types.ObjectId,
        ref: 'primaryservices'
    },
    pincode: {
        type: String,
        index: true,
    },
    skip: {
        type: Number
    },
    total_count: {
        type: Number,
    }
}, {
    timestamps: true
})

const broadCastCacheSchemmaSchema = mongoose.model('cache', broadCastCacheSchemma);

module.exports = broadCastCacheSchemmaSchema;