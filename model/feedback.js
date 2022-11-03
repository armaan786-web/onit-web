const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus } = require('../common/const')


const feedBack = mongoose.Schema({
    ticket_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'ticket'
    },
    center_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'center'
    },
    expires_in: {
        type: Number
    },
    token: { type: String, index: true },
    over_all_rating: {
        type: String
    },
    feedBackResponse: [{
        question: {
            type: String,
        },
        answer: { type: String },
        rating: { type: Number }
    }],
    is_already_submitted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const feedBackSchema = mongoose.model('feedback', feedBack);

module.exports = feedBackSchema;