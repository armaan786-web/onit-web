const Counters = require("../model/counterModel");


module.exports.getNextSequenceValue = (sequenceName) => {
    return new Promise((resolve, reject) => {

        // let collection = db.collection('counters');
        Counters.collection.findAndModify(
            { "_id": sequenceName },
            [],
            { "$inc": { sequence_value: 1 } },
            { upsert: true, new: true },
            function (err, result) {
                if (result && result.value && result.value.sequence_value) {
                    return resolve(parseInt(result.value.sequence_value));
                } else {
                    return reject(err || "Something went wrong")
                }

            }
        );
    });
}
