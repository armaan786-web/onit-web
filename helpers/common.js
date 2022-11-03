const jwt = require("jsonwebtoken");
const commonFunctions = require('../common/common')
var FCM = require('fcm-node');


var FCM_KEY = "BC1JNqLOTeKIEi0yw5Sk2rJ7glDVN2-58TChTlfASW-7UhvIpZAKstcPQOLqECFHUUea2MG6SEUvCWlKcj3fQ-E"



module.exports.sendAndroidPushNotificationUsingFCM = (deviceToken, pushMessage, deviceType, userId) => {
    return new Promise((resolve, reject) => {
        try {
            var fcm = new FCM(FCM_KEY);
            var message = {
                to: deviceToken,
                data: {
                    title: pushMessage.title || 'Title of your push notification',
                    body: pushMessage.body || 'Body of your push notification'
                }
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("there is err in sending notification", err)
                } else {
                    let insertObj = {
                        user_id: userId,
                        device_type: deviceType,
                        device_token: deviceToken,
                        notification_type: 1,
                        notification_title: pushMessage.title,
                        notification_message: pushMessage.body,
                        is_seen: 0
                    }
                }
            });
        } catch (e) { }
        return resolve(true);
    });
}


module.exports.objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    return value;
};

exports.addDaysToTime = (no_of_days) => {
    var date = new Date();
    date.setDate(date.getDate() + no_of_days);
    return date;

}

module.exports.generateAccessToken = (details) => {

    try {
        return jwt.sign(details, commonFunctions.tokenDetails.TOKENSECRET, {
            expiresIn: "27d",
        });
    } catch (e) {
        throw new Error(e.message)
    }


}

module.exports.checkGstNumberIsValid = async (gstNumber) => {
    try {

        let gstRegex = "^[0-9]{2}[A-Z]{5}[0-9]{4}"
            + "[A-Z]{1}[1-9A-Z]{1}"
            + "Z[0-9A-Z]{1}$";

        let isValid = gstNumber.match(gstRegex);
        if (!isValid) {
            return false;
        }
        return true;

    } catch (err) {
        throw new Error(err.message)
    }
}