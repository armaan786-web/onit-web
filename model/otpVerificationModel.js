const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationSchema = mongoose.Schema({

    country_code: {
        type: String,
    },
    mobile_number: {
        type: Number,
    },
    otp: {
        type: Number,
    },
    expries_at: {
        type: Number,
    },
    verified: {
        type: Boolean,
        default: false
    }

},
    {
        timestamps: true
    });

const verificationDriver = mongoose.model('verificationOtp', verificationSchema);
module.exports = verificationDriver;
