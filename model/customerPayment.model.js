const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { availableStatusOfBroadCastTicket, activeStatus, availablePaymentStatus } = require('../common/const')


const orderCustomerModel = mongoose.Schema({
    ticket_obj_id: {
        type: mongoose.Types.ObjectId,
        ref: 'ticket'
    },
    customer_details: {
        phone: {
            type: String
        },
        country_code: {
            type: String
        }
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

const orderSchemaCustomer = mongoose.model('ordersCustomer', orderCustomerModel);

module.exports = orderSchemaCustomer;