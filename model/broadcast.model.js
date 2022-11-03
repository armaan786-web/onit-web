const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus } = require('../common/const')


const broadCastModel = mongoose.Schema({
    ticket_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'ticket'
    },
    center_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'center'
    },
    status_of_ticket: {
        type: String,
        enum: availableStatusOfBroadCastTicket
    },
    is_active: {
        type : Number,
        default: activeStatus.ACTIVE,
        index: true

    }
}, {
    timestamps: true
})

const broadCastModelSchema = mongoose.model('broadcast', broadCastModel);

module.exports = broadCastModelSchema;