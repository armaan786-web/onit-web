const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
// const verificationDb = require('../../model/verificationForDriver.model');

// const { statusOfShipmentValues } = require('../../common/driverConst')
const commonFolder = require('../../common/common')

const authServices = require('./auth_services')
// const notificationService = require('../../helpers/NotificationService')

const commonFunctionForAuth = require('../../helpers/common')

let msg = "";


exports.sentotp = async (req, res, next) => {
    try {

        let { country_code, mobile_number } = req.body

        await authServices.checkIfTheDriverPhoneNumberAlreadyExists(country_code, mobile_number)

        let deleteCri = {
            country_code,
            mobile_number
        }

        await verificationDb.deleteMany(deleteCri)

        let otpDetails = commonFolder.getOtpCreation()

        let otp = otpDetails.otp
        let expires_in = otpDetails.expires_in


        let msgToSend = `Hii  your otp is ${otp} and your otp expires in next 5 min `

        // await notificationService.sentMessageViaTwilio(msgToSend, country_code, mobile_number)


        let insertObj = {
            country_code,
            mobile_number,
            otp,
            expries_at: expires_in
        }

        await new verificationDb(insertObj).save()

        msg = "Otp has been sent successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}
