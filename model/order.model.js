const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus, availablePaymentStatus } = require('../common/const')


const orderModel = mongoose.Schema({
    ticket_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'ticket'
    },
    center_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'center'
    },
    broadcast_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'broadcast'
    },
    sumPriceToPay: {
        type: String,
    },
    receipt: {
        type: String,
    },
    currency: {
        type: String,
    },
    order_id: {
        type: String,
        index: true
    },
    payment_for: {
        type: String,
        enum: ["ticket", "onboarding"]
    },
    payment_status: {
        type: String,
        enum: availablePaymentStatus
    },
    is_active: {
        type: Number,
        default: activeStatus.ACTIVE,
        index: true

    }
}, {
    timestamps: true
})

const orderSchema = mongoose.model('orders', orderModel);

module.exports = orderSchema;