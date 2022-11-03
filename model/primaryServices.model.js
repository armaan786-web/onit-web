const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { activeStatus } = require('../common/const')

const primaryservices = mongoose.Schema({

    service_name: {
        type: String,
    },
    service_slug: {
        type: String,
        // unique: true,
    },
    sort_order: {
        type: Number,
    },
    image: {
        type: String,
    },
    pin_code: {
        type: String,
        index: true,
    },
    geo_location: {
        type: String,
        index: true,
    },
    is_active: {
        type: Number,
        default: activeStatus.ACTIVE
    }
},
    {
        timestamps: true
    });

const primaryservicesSchema = mongoose.model('primaryservices', primaryservices);
module.exports = primaryservicesSchema;