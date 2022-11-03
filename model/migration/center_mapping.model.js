const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CenterMapping = mongoose.Schema({
    sql_center_id: {
        type: Number,
    },
    mongo_center_id: {
        type: mongoose.Types.ObjectId,
        ref: 'center'
    },
}, {
    timestamps: true
})

const CenterMappingSchema = mongoose.model('centermapping', CenterMapping);

module.exports = CenterMappingSchema;