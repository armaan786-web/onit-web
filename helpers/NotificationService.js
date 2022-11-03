const config = require('../common/common');
// const client = require('twilio')(config.twilo.TWILIO_SID, config.twilo.TWILIO_AUTH);
const axios = require('axios');


exports.sentMessageViaTwilio = async (msg, country_code, phone_number) => {
    try {
        // await client.messages.create({
        //     body: msg,
        //     messagingServiceSid: config.twilo.TWILIO_SID,
        //     to: country_code + phone_number,
        // })

    } catch (e) {
        throw new Error(e.message)
    }
}

exports.sendOtpViaMasssms = async (templateId, number, msg) => {
    try {
        var url = config.SMSDetails.URL + templateId + `&senderid=${config.SMSDetails.SENDER_ID}&number=` + number + '&message=' + msg + '&format=json';

        console.log(url , "url")
        let response = await axios.get(url);


    } catch (e) {
        throw new Error(e.message)

    }
}