const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
const centerDb = require('../../model/center.model');
const verificationDb = require('../../model/otpVerificationModel')
const technicianDb = require('../../model/technician.model')
const ticketDb = require('../../model/ticket.model')
const broadCastDb = require('../../model/broadcast.model')
const orderDb = require('../../model/order.model')
const FeedBackDb = require('../../model/feedback')

const notificationService = require('../../helpers/NotificationService')
const commonFolder = require('../../common/common')

const technicianService = require('./technician_services')

const commonFunctionForAuth = require('../../helpers/common');
const { ticketCreatedBy, rolesBasedOnNumberOfTechnician, engagementType, profileCreatedBy, TicketAssignType, broadCastStatus, statusOfBroadcastTicket, ticketStatus, availableStatusOfBroadCastTicket, availablePaymentStatus, paymentStatus } = require('../../common/const');

let msg = ""

exports.registerTechnician = async (req, res, next) => {
    try {
        let { personal_details, primary_services, secondary_services, service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, emergency_details,
            document_details, referenceDetails } = req.body

        let { phone } = personal_details
        let { country_code, mobile_number } = phone
        console.log(req.body, "sequenceForCenter", "sssssssssss")

        mobile_number = mobile_number.trim()

        await technicianService.checkIfTechnicianDoesNotExists(country_code, mobile_number)

        await technicianService.checkIFTheOtpIsVerifiedForThisNumber(country_code, mobile_number)

        let insertObj = {
            personal_details,
            services: {
                primary_services,
                secondary_services
            },
            service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, document_details, referenceDetails,
            profile_created_by: profileCreatedBy?.SELF,
            emergency_details
        }


        let inserttObjReult = await new technicianDb(insertObj).save()

        let technicianMobileNumber = "91" + mobile_number
        let varBookingUrl = "https://onit.services/#/booking"
        let msg = `Services are now digital OniT! Use online booking link ${varBookingUrl} anytime anywhere. Share on FB and Whatsapp ${varBookingUrl}`

        await notificationService.sendOtpViaMasssms(commonFolder.SMSDetails.CENTER_REGISTRATION, technicianMobileNumber, msg)

        await verificationDb.deleteMany({ country_code, mobile_number })

        msg = "Technician has been created successfully";
        let resData = {};
        actionCompleteResponse(res, resData, msg);

    } catch (err) {

        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.loginWithOtp = async (req, res, next) => {
    try {
        let { country_code, mobile_number, otp, device_id } = req.body

        await technicianService.checkIfTheOtpIsValid(country_code, mobile_number, otp)

        let technicianDetails = await technicianService.checkIfTechnicianExists(country_code, mobile_number)

        let isDisabled = technicianDetails.disabled_for?.login_into_application || false

        if (isDisabled) {
            throw new Error("Your account has been disabled to login, contact admin")
        }

        let tokenEmbed = {
            _id: technicianDetails._id,
            first_name: technicianDetails.personal_details.email
        }


        await technicianDb.findOneAndUpdate({ _id: technicianDetails._id }, { device_id }, { new: true })

        let populatedTechnicianDetails = await technicianDb.findOne({ _id: technicianDetails._id }).populate('services.primary_services').populate('services.secondary_services.secondary_services_id').populate('clients_ids_list').populate('center_id')

        let token = commonFunctionForAuth.generateAccessToken(tokenEmbed)

        await verificationDb.deleteMany({ country_code, mobile_number })

        msg = "Loged in successfully"
        let resData = { token, technicianDetails, populatedTechnicianDetails }
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }

}

exports.verifyOtp = async (req, res, next) => {
    try {
        let { country_code, mobile_number, otp } = req.body

        let verificationResult = await technicianService.checkIfTheOtpIsValid(country_code, mobile_number, otp)

        let updateCri = {
            verified: true
        }

        await verificationDb.findOneAndUpdate({ _id: verificationResult._id }, updateCri, { new: true })

        msg = "Otp has been verified successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.sentotp = async (req, res, next) => {
    try {

        let { action } = req.query;
        let { country_code, mobile_number } = req.body

        if (action === "registration") {
            await technicianService.checkIfTechnicianDoesNotExists(country_code, mobile_number);
        } else if (action === "login") {
            let centerDetails = await technicianService.checkIfTechnicianExists(country_code, mobile_number);
        }

        let deleteCri = {
            country_code,
            mobile_number
        }

        await verificationDb.deleteMany(deleteCri)

        let otpDetails = commonFolder.getOtpCreation()

        let otp = otpDetails.otp
        let expires_in = otpDetails.expires_in


        // let msgToSend = `Hii  your otp is ${otp} and your otp expires in next 5 min `
        let msgToSend = "Use OTP " + otp + " to login to your OniT account.";
        // await notificationService.sentMessageViaTwilio(msgToSend, country_code, mobile_number)
        let mobileNumeber = "91" + mobile_number
        await notificationService.sendOtpViaMasssms(commonFolder.SMSDetails.OTP_TEMPLATE_ID, mobileNumeber, msgToSend)

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