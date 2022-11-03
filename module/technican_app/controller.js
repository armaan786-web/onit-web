
const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
const centerDb = require('../../model/center.model');

const technicianDb = require('../../model/technician.model')
const broadCastDb = require('../../model/broadcast.model')
const ticketDb = require('../../model/ticket.model')
const clientDb = require('../../model/client.model');
const centerServices = require('../center/center_services')
const Razorpay = require("razorpay");
const shortid = require("shortid");
const crypto = require("crypto");
const commonFolder = require('../../common/common');
const { paymentStatus, statusOfBroadcastTicket, broadCastStatus, ticketStatus, ticketCreatedBy, sequence_generator, engagementType, profileCreatedBy } = require('../../common/const');
const orderDb = require('../../model/order.model')
const counterHelper = require('../../helpers/dbHelper');
const requestTechnicianModel = require('../../model/requestTechnician.model');
const mongoose = require('mongoose');

const razorpay = new Razorpay({
    key_id: commonFolder.razorPayKey.key_id,
    key_secret: commonFolder.razorPayKey.key_secret,
});


exports.getAllTicketsCreatedNotAssigned = async (req, res, next) => {
    try {
        let { skip, limit } = req.query
        let centerDetails = req.centerDetails

        if (!centerDetails) {
            throw new Error("No center attached")
        }

        let skipItem = Number(skip) || 0
        let limitItem = Number(limit) || 0;

        let findCri = {
            created_by: centerDetails._id,
            $or: [{
                "assigned_ids.assigned_center_id": {
                    $ne: centerDetails._id
                },
            }, {
                "assigned_ids.assigned_center_id": {
                    $exists: true
                },
            }, {
                "assigned_ids.assigned_center_id": {
                    $exists: false
                },
            }],

            broadcast_status: {
                $ne: broadCastStatus.MATCHED_IN_SAME_CENTER
            }
        }

        let ticketData = await ticketDb.find(findCri).populate('service_provided_for').populate('created_by').populate('assigned_ids.assigned_center_id').skip(skipItem).limit(limitItem)
        let totalCount = await ticketDb.countDocuments(findCri)

        msg = "Data retrived Successfully"
        let data = ticketData
        actionCompleteResponsePagination(res, data, msg, totalCount)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.getAllTechnicianTicketCount = async (req, res, next) => {
    try {
        let { ticket_obj_id } = req.query
        let centerId = req?.centerDetails._id

        let ticketDetails = await ticketDb.findOne({ _id: ticket_obj_id })

        if (!ticketDetails) {
            throw new Error("Invalid ticket id")
        }

        let servicesId = mongoose.Types.ObjectId(ticketDetails.service_provided_for)

        let findCri = {
            center_id: {
                $in: mongoose.Types.ObjectId(centerId)
            },
            $or: [{
                "services.primary_services": servicesId
            }, {
                "services.secondary_services.secondary_services_id": servicesId
            }]
        }

        let agg = [{
            $match: findCri
        }, {
            $lookup: {
                from: "tickets",
                "let": { "technicanId": "$_id" },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [{
                                    "$eq": ["$assigned_ids.assigned_technician_id", "$$technicanId"]
                                }, {
                                    "$eq": ["$ticket_status", "PENDING"]
                                }]
                            },
                        }
                    }
                ],
                "as": "technicianTickets"
            }
        }]


        let technicianList = await technicianDb.aggregate(agg)

        msg = "technician Details fetched";
        let resData = {
            technicianList
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllOrderDetails = async (req, res, next) => {
    try {
        let { skip, limit } = req.query
        let skipInt = parseInt(skip) || 0
        let limitInt = parseInt(limit) || 200

        let centerId = req?.centerDetails._id

        let findCriteria = {
            center_obj_id: centerId
        }

        let paymentDetails = await orderDb.find(findCriteria).populate('ticket_obj_id')
            .populate('broadcast_obj_id')
            .skip(skipInt)
            .limit(limitInt)

        msg = "Data retrived Successfully"
        let resData = {
            paymentDetails
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.rejectRequestForSalaried = async (req, res, next) => {
    try {
        let { requestId } = req.body;

        let findCri = {
            _id: requestId
        }
        let requestDetails = await requestTechnicianModel.findOne(findCri);

        if (!requestDetails) {
            throw new Error("This request doesn't exists");
        }

        let updateCri = {
            request_status: 'REJECTED',
            actioned_on: new Date()

        }

        await requestTechnicianModel.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Request has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);
    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.rejectRequestForFreelancer = async (req, res, next) => {
    try {
        let { requestId } = req.body;

        let findCri = {
            _id: requestId
        }
        let requestDetails = await requestTechnicianModel.findOne(findCri);

        if (!requestDetails) {
            throw new Error("This request doesn't exists");
        }

        let updateCri = {
            request_status: 'REJECTED',
            actioned_on: new Date()

        }

        await requestTechnicianModel.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Request has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);
    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.checkRequestLink = async (req, res, next) => {
    try {
        let { token } = req.query

        let findCri = {
            token,
        }

        let isRequestExists = await requestTechnicianModel.findOne(findCri)

        let invalidRequestTechnicianLink = false
        let isRequestAlreadySubmitted = false
        let submitRequest = false
        let is_link_expired = false

        console.log(isRequestExists, "isRequestExists")

        if (!isRequestExists) {
            invalidRequestTechnicianLink = true
        } else {

            if (isRequestExists.request_status === "ACCEPTED" || isRequestExists.request_status === "REJECTED") {
                isRequestAlreadySubmitted = true
            } else {
                submitRequest = true
            }

            if (!(isRequestExists.expires_in > Date.now())) {
                is_link_expired = true
            }
        }


        let response = {
            invalidRequestTechnicianLink,
            isRequestAlreadySubmitted,
            submitRequest,
            is_link_expired,
            isRequestExists
        }

        return actionCompleteResponse(res, response)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.acceptRequestTechnicianForFreelancer = async (req, res, next) => {
    try {
        let { request_status, request_id } = req.body

        const freelancer_techician_id = req.technicianDetails._id;

        let findCri = {
            _id: request_id,
            freelancer_techician_id
        }

        let requestDetails = await requestTechnicianModel.findOne(findCri)
        if (!requestDetails) {
            throw new Error("Invalid request details")
        }

        if (requestDetails.request_status === "ACCEPTED") {
            throw new Error("Request already accepted")
        }

        if (requestDetails.request_status === "REJECTED") {
            throw new Error("Request already rejected")
        }
        let updateCri = {
            actioned_on: new Date()
        };

        request_status ? updateCri['request_status'] = request_status : ''

        await requestTechnicianModel.findOneAndUpdate(findCri, updateCri, { new: true })


        if (request_status == "ACCEPTED") {
            let updateCritech = {
                center_id: {
                    $addToSet: requestDetails.center_id_inviting
                }
            }


            await technicianDb.findOneAndUpdate({ _id: freelancer_techician_id }, updateCritech, { new: true })

        }


        msg = "Request has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.acceptRequestTechnicianForSalaried = async (req, res, next) => {
    try {
        let { request_status, request_id } = req.body

        let findCri = {
            _id: request_id
        }

        let requestDetails = await requestTechnicianModel.findOne(findCri)
        if (!requestDetails) {
            throw new Error("Invalid request details")
        }

        if (requestDetails.request_status === "ACCEPTED") {
            throw new Error("Request already accepted")
        }

        if (requestDetails.request_status === "REJECTED") {
            throw new Error("Request already rejected")
        }
        let updateCri = {
            actioned_on: new Date()
        };

        request_status ? updateCri['request_status'] = request_status : ''

        await requestTechnicianModel.findOneAndUpdate(findCri, updateCri, { new: true })


        if (request_status == "ACCEPTED") {
            let updateCritech = {
                center_id: {
                    $addToSet: requestDetails.center_id_inviting
                }
            }


            await technicianDb.findOneAndUpdate({ _id: requestDetails.technicianDetails._id }, updateCritech, { new: true })

        }

        msg = "Request has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.getAllTechnicianRequests = async (req, res, next) => {
    try {
        let centerId = req?.centerDetails._id

        let findCriteria = {
            center_id_inviting: centerId
        }

        let requestDetails = await requestTechnicianModel.find(findCriteria)

        msg = "Data retrived Successfully"
        let resData = {
            requestDetails
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.updateTicketDetails = async (req, res, next) => {
    try {
        let { service_provided_for, specific_requirement, personal_details, address_details
            , assigned_ids, time_preference, closing_ticket_price, offers_applied, ticket_status, ticket_obj_id,
            onsite_pictures, technician_remarks, customer_message, center_message, take_time, start_job
        } = req.body

        let findCri = {
            _id: ticket_obj_id,
        }

        let ticketObjectBeforeUpdate = await ticketDb.findOne(findCri);

        if (!ticketObjectBeforeUpdate) {
            throw new Error("Ticket not found, can't update");
        }

        let updateCri = {}

        service_provided_for ? updateCri['service_provided_for'] = service_provided_for : ''
        specific_requirement ? updateCri['specific_requirement'] = specific_requirement : ''

        personal_details?.primary_phone ? updateCri['personal_details.primary_phone'] = personal_details?.primary_phone : ''
        personal_details?.alternate_phone ? updateCri['personal_details.alternate_phone'] = personal_details?.alternate_phone : ''
        personal_details?.name ? updateCri['personal_details.name'] = personal_details?.name : ''

        address_details?.house_number ? updateCri['address_details.house_number'] = address_details?.house_number : ''
        address_details?.locality ? updateCri['address_details.locality'] = address_details?.locality : ''
        address_details?.city ? updateCri['address_details.city'] = address_details?.city : ''
        address_details?.state ? updateCri['address_details.state'] = address_details?.state : ''
        address_details?.pincode ? updateCri['address_details.pincode'] = address_details?.pincode : ''
        address_details?.additional_pincode ? updateCri['address_details.additional_pincode'] = address_details?.additional_pincode : ''
        address_details?.short_code_for_place ? updateCri['address_details.short_code_for_place'] = address_details?.short_code_for_place : ''
        address_details?.country ? updateCri['address_details.country'] = address_details?.country : ''
        address_details?.google_geo_location ? updateCri['address_details.google_geo_location'] = address_details?.google_geo_location : ''

        time_preference?.time_preference_type ? updateCri['time_preference.time_preference_type'] = time_preference?.time_preference_type : ''
        time_preference?.specific_date_time ? updateCri['time_preference.specific_date_time'] = time_preference?.specific_date_time : ''
        time_preference?.specific_date_time_time_stamp ? updateCri['time_preference.specific_date_time_time_stamp'] = time_preference?.specific_date_time_time_stamp : ''


        assigned_ids?.assigned_technician_id ? updateCri['assigned_ids.assigned_technician_id'] = assigned_ids?.assigned_technician_id : ''
        assigned_ids?.assigned_center_id ? updateCri['assigned_ids.assigned_center_id'] = assigned_ids?.assigned_center_id : ''
        // assigned_ids?.assign_type ? updateCri['assigned_ids.assign_type'] = assigned_ids?.assign_type : ''

        ticket_status ? updateCri['ticket_status'] = ticket_status : ''
        closing_ticket_price ? updateCri['closing_ticket_price'] = closing_ticket_price : ''

        onsite_pictures ? updateCri['onsite_pictures'] = onsite_pictures : ''
        technician_remarks ? updateCri['technician_remarks'] = technician_remarks : ''

        customer_message ? updateCri['messages.customer_message'] = customer_message : ''
        center_message ? updateCri['messages.center_message'] = center_message : ''

        take_time ? updateCri['take_time'] = take_time : ''
        start_job ? updateCri['start_job'] = start_job : ''


        let ticketUpdateResponse = await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true });

        // if (ticketUpdateResponse) {
        //     await adminServices.reBroadcastTicket(ticketObjectBeforeUpdate, ticketUpdateResponse);
        // }

        msg = "Ticket has been updated successfully";
        let resData = {
            ticketUpdateResponse
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.getBookingDetails = async (req, res, next) => {
    try {
        let { ticket_object_id } = req.query

        let findCri = {
            _id: ticket_object_id,
            // ticket_status: {
            //     $in: [ticketStatus.PENDING, ticketStatus.ACCEPTED]
            // }
        }

        let ticketData = await ticketDb.find(findCri).populate('service_provided_for').populate('created_by').populate('assigned_ids.assigned_center_id')

        msg = "Data retrived Successfully"
        let data = ticketData
        actionCompleteResponsePagination(res, data, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.getAllOppuritiesInYourArea = async (req, res, next) => {
    try {
        let centerDetails = req.centerDetails

        let matchCriteria = {

        }

        let agg = [{
            $match: matchCriteria
        }, {
            $group: {
                _id: "$service_provided_for",
                no_of_tickets_available: {
                    $sum: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$ticket_status", "ACCEPTED"]
                                }, {
                                    $eq: ["$ticket_status", "PENDING"]
                                }]
                            }, then: 1, else: 0
                        }
                    }

                },
                no_of_pending_tickets: {
                    $sum: {
                        $cond: { if: { $eq: ["$ticket_status", "PENDING"] }, then: 1, else: 0 }
                    }
                }
            }
        }, {
            $sort: {
                _id: -1
            }
        }, {
            $lookup: {
                from: 'primaryservices',
                localField: "_id",
                foreignField: "_id",
                as: "primary_service"
            }
        }, {
            $unwind: "$primary_service"
        }, {
            $lookup: {
                from: 'technicians',
                localField: "_id",
                foreignField: "services.primary_services",
                as: "technicians"
            }
        }, {
            $project: {
                primary_service: 1,
                no_of_tickets_available: 1,
                no_of_pending_tickets: 1,
                no_of_technicians: { $size: "$technicians" },

            }
        }]

        let totalData = await ticketDb.aggregate(agg)


        msg = "Your oppurnities in area";
        let resData = {
            totalData
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.afterPayingOnBoarding = async (req, res, next) => {
    try {
        let payload = req.body
        let razorpay_payment_id = payload.razorpay_payment_id
        let razorpay_order_id = payload.razorpay_order_id
        let razorpay_signature = payload.razorpay_signature
        const shasum = crypto.createHmac('sha256', commonFolder.razorPayKey.key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (!(digest == razorpay_signature)) {
            throw new Error('Payment Not Valid Please Pay Again')
        }

        let findCriteria = {
            order_id: razorpay_order_id
        }
        let updateCriteria = {
            payment_status: paymentStatus.SUCCESS
        }
        let userOrderFound = await orderDb.find(findCriteria)
        if (!(userOrderFound && Array.isArray(userOrderFound) && userOrderFound.length)) {
            throw new Error("Order Id not Found: ")
        }

        let updatedOrderStatus = await orderDb.findOneAndUpdate(findCriteria, updateCriteria, { new: true })


        let centerDetails = req.centerDetails

        await centerDb.findOneAndUpdate({ _id: centerDetails._id }, {
            "payment_details.paid_for_onboarding_kit": true
        }, { new: true })

        msg = "Your onboarding payment is completed";
        let resData = {
            updatedOrderStatus
        };
        actionCompleteResponse(res, resData, msg);



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.acceptTicketAfterPayment = async (req, res, next) => {
    try {
        let payload = req.body
        let razorpay_payment_id = payload.razorpay_payment_id
        let razorpay_order_id = payload.razorpay_order_id
        let razorpay_signature = payload.razorpay_signature
        const shasum = crypto.createHmac('sha256', commonFolder.razorPayKey.key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (!(digest == razorpay_signature)) {
            throw new Error('Payment Not Valid Please Pay Again')
        }

        let findCriteria = {
            order_id: razorpay_order_id
        }
        let updateCriteria = {
            payment_status: paymentStatus.SUCCESS
        }
        let userOrderFound = await orderDb.find(findCriteria)
        if (!(userOrderFound && Array.isArray(userOrderFound) && userOrderFound.length)) {
            throw new Error("Order Id not Found: ")
        }

        let updatedOrderStatus = await orderDb.findOneAndUpdate(findCriteria, updateCriteria, { new: true })

        let criTicket = {
            _id: userOrderFound[0].ticket_obj_id
        }

        let findCri = {
            _id: userOrderFound[0].broadcast_obj_id,
        }

        let updateTicketCri = {
            "assigned_ids.assigned_center_id": userOrderFound[0].center_obj_id,
            "ticket_status": ticketStatus.ACCEPTED,
            broadcast_status: broadCastStatus.ACCEPTED_AFTER_BROADCAST

        }

        await ticketDb.findOneAndUpdate(criTicket, updateTicketCri, { new: true })

        let criteriaBrocastTicket = {
            ticket_obj_id: userOrderFound[0].ticket_obj_id,

        }

        let updateCriBroadCast = {
            status_of_ticket: statusOfBroadcastTicket.EXPIRED
        }

        await broadCastDb.updateMany(criteriaBrocastTicket, updateCriBroadCast)


        let updateCriAccept = {
            status_of_ticket: statusOfBroadcastTicket.ACCEPTED
        }

        await broadCastDb.findOneAndUpdate(findCri, updateCriAccept, { new: true })

        msg = "Your ticket payment is completed";
        let resData = {
            updatedOrderStatus
        };
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.acceptBroadCastRequest = async (req, res, next) => {
    try {
        let { broadcast_obj_id } = req.body
        let centerDetails = req.centerDetails


        let isDisabled = centerDetails.disabled_for?.login_into_application || false

        if (isDisabled) {
            throw new Error("Your account has been disabled to login, contact admin")
        }

        let isDisabledForAcceptingBroadCastingRequest = centerDetails.disabled_for?.accepting_broadcast_ticket || false


        if (isDisabledForAcceptingBroadCastingRequest) {
            throw new Error("You have been blocked to accept more request , contact admin")
        }

        let findCri = {
            center_obj_id: centerDetails._id,
            _id: broadcast_obj_id,
        }

        let brodCastDetails = await broadCastDb.findOne(findCri).populate('ticket_obj_id')
        if (!brodCastDetails) {
            throw new Error("Invalid broadCast details")
        }

        await centerServices.checkIfBroadCastIsAlreadyAccepted(brodCastDetails.ticket_obj_id)

        await centerServices.checkIfCenterCanAcceptMoreBroadCastedTickets(centerDetails._id)

        let ticketDetails = brodCastDetails.ticket_obj_id

        if (!(ticketDetails?.admin_setting?.is_paid)) {
            throw new Error("This is not a paid ticket this is a free ticket")
        }

        let findCriteriaForMathcingTechnician = {
            $or: [{
                $or: [{
                    "services.primary_services": mongoose.Types.ObjectId(ticketDetails.service_provided_for)
                }, {
                    "services.secondary_services.secondary_services_id": mongoose.Types.ObjectId(ticketDetails.service_provided_for)
                }]
            }, {
                $or: [{
                    service_area_main_pincode: ticketDetails.address_details.pincode
                }, {
                    service_area_secondary_pincode: {
                        $in: [ticketDetails.address_details.pincode]
                    }
                }]
            }],
            center_id: {
                $in: [mongoose.Types.ObjectId(centerDetails._id)]
            },
        }


        let technicianFound = await technicianDb.findOne(findCriteriaForMathcingTechnician)

        if (!technicianFound) {
            throw new Error("No technician found in your center with particular skills ")
        }


        let ticketPrice = ticketDetails.ticket_price || 99


        const options = {
            amount: ticketPrice * 100,
            currency: "INR",
            receipt: "onit" + shortid.generate(),
            payment_capture: 1,
        };
        const response = await razorpay.orders.create(options);

        let insertOrderObj = {
            ticket_obj_id: ticketDetails._id,
            center_obj_id: centerDetails._id,
            broadcast_obj_id: broadcast_obj_id,
            payment_status: paymentStatus.PENDING,
            sumPriceToPay: options.amount,
            currency: "INR",
            order_id: response.id,
            receipt: options.receipt,
            payment_for: "ticket"
        }

        await new orderDb(insertOrderObj).save()


        msg = "Your ticket payment is initialized";
        let resData = {
            ticketDetails,
            payment_response: response,
            centerDetails
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}


exports.payOnBoardingKit = async (req, res, next) => {
    try {
        let centerDetails = req.centerDetails


        if (centerDetails?.payment_details?.paid_for_onboarding_kit) {
            throw new Error("You have aldready Paid for onboarding Kit")
        }


        const options = {
            amount: 499 * 100,
            currency: "INR",
            receipt: "onit" + shortid.generate(),
            payment_capture: 1,
        };
        const response = await razorpay.orders.create(options);

        let insertOrderObj = {
            center_obj_id: centerDetails._id,
            payment_status: paymentStatus.PENDING,
            sumPriceToPay: options.amount,
            currency: "INR",
            order_id: response.id,
            receipt: options.receipt,
            payment_for: "onboarding"

        }

        await new orderDb(insertOrderObj).save()

        msg = "Your onboarding kit payment is initialized";
        let resData = {
            payment_response: response,
        };
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.acceptBroadCastUnPaidTicket = async (req, res, next) => {
    try {
        let { broadcast_obj_id } = req.body
        let centerDetails = req.centerDetails

        let findCri = {
            center_obj_id: centerDetails._id,
            _id: broadcast_obj_id,
        }

        let brodCastDetails = await broadCastDb.findOne(findCri).populate('ticket_obj_id')
        if (!brodCastDetails) {
            throw new Error("Invalid broadCast details")
        }

        await centerServices.checkIfBroadCastIsAlreadyAccepted(brodCastDetails.ticket_obj_id)

        await centerServices.checkIfCenterCanAcceptMoreBroadCastedTickets(centerDetails._id)


        let ticketDetails = brodCastDetails.ticket_obj_id

        if (ticketDetails?.admin_setting?.is_paid && !ticketDetails?.is_paid_by_public) {
            throw new Error("This is a paid ticket this is not a free ticket")
        }

        let findCriteriaForMathcingTechnician = {
            $or: [{
                primary_services: ticketDetails.service_provided_for._id
            }, {
                "secondary_services.secondary_services_id": ticketDetails.service_provided_for._id
            }],
            $or: [{
                service_area_main_pincode: ticketDetails.address_details.pincode
            }, {
                service_area_secondary_pincode: {
                    $in: [ticketDetails.address_details.pincode]
                }
            }],
            center_id: centerDetails._id,
        }

        let technicianFound = await technicianDb.findOne(findCriteriaForMathcingTechnician)

        if (!technicianFound) {
            throw new Error("No technician found in your center with particular skills ")
        }


        let criTicket = {
            _id: ticketDetails._id
        }


        let updateTicketCri = {
            "assigned_ids.assigned_center_id": centerDetails._id,
            "ticket_status": ticketStatus.ACCEPTED,
            broadcast_status: broadCastStatus.ACCEPTED_AFTER_BROADCAST

        }

        await ticketDb.findOneAndUpdate(criTicket, updateTicketCri, { new: true })

        let criteriaBrocastTicket = {
            ticket_obj_id: ticketDetails._id,

        }

        let updateCriBroadCast = {
            status_of_ticket: statusOfBroadcastTicket.EXPIRED
        }

        await broadCastDb.updateMany(criteriaBrocastTicket, updateCriBroadCast)


        let updateCriAccept = {
            status_of_ticket: statusOfBroadcastTicket.ACCEPTED
        }

        await broadCastDb.findOneAndUpdate(findCri, updateCriAccept, { new: true })

        msg = "Ticket is accepted successfully";
        let resData = {};
        actionCompleteResponse(res, resData, msg);



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}



exports.getALlClients = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}


        let results = await clientDb.find(crit).sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await clientDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.getALlTickets = async (req, res, next) => {
    try {

        let { skip, limit, ticketStatus } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {

        }

        ticketStatus ? crit['ticket_status'] = ticketStatus : ''

        if (req.technicianDetails.is_technician_admin) {
            crit = {
                ...crit,
                'assigned_ids.assigned_center_id': {
                    $in: req.technicianDetails?.center_id
                }
            }
        } else {
            crit = {
                ...crit,
                'assigned_ids.assigned_technician_id': req.technicianDetails?._id
            }
        }

        let results = await ticketDb.find(crit).populate("service_provided_for")
            .skip(skipp).limit(limitt).sort({ _id: -1 })
        let totalCount = await ticketDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getPendingTickets = async (req, res, next) => {
    try {
        let { skip, limit, status } = req.query

        let skipItem = Number(skip) || 0
        let limitItem = Number(limit) || 20;

        console.log(req.technicianDetails, "req.technicianDetails")
        let centerIds = req.technicianDetails?.center_id?.map(ite => ite.toString())

        console.log(typeof centerIds[0])
        let findCri = {
            center_obj_id: {
                $in: centerIds
            },
            status_of_ticket: statusOfBroadcastTicket.PENDING
        }

        console.log(findCri, "findCri", limitItem, skipItem)


        // if (status) {
        //     findCri.status = status
        // }

        let results = await broadCastDb.find(findCri).populate({
            path: 'ticket_obj_id',
            populate: { path: 'service_provided_for' }
        }).sort({ createdAt: -1 }).skip(skipItem).limit(limitItem).exec()

        let totalCount = await broadCastDb.countDocuments(findCri)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.updateTechnician = async (req, res, next) => {
    try {
        let { personal_details, primary_services, secondary_services, service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, emergency_details,
            document_details, referenceDetails, center_obj_id
        } = req.body

        let findCri = {
            _id: req.technicianDetails?._id
        }

        let updateCri = {}

        //todo make the array data as operation types
        center_obj_id ? updateCri['center_id'] = center_obj_id : ''

        personal_details?.phone ? updateCri['personal_details.phone'] = personal_details?.phone : ''
        personal_details?.email ? updateCri['personal_details.email'] = personal_details?.email : ''
        personal_details?.name ? updateCri['personal_details.name'] = personal_details?.name : ''
        personal_details?.user_name ? updateCri['personal_details.user_name'] = personal_details?.user_name : ''
        personal_details?.about ? updateCri['personal_details.about'] = personal_details?.about : ''
        personal_details?.dob ? updateCri['personal_details.dob'] = personal_details?.dob : ''
        personal_details?.profile_picture ? updateCri['personal_details.profile_picture'] = personal_details?.profile_picture : ''
        personal_details?.company_worked_with ? updateCri['personal_details.company_worked_with'] = personal_details?.company_worked_with : ''

        primary_services ? updateCri['services.primary_services'] = primary_services : ''
        secondary_services ? updateCri['services.secondary_services'] = secondary_services : ''

        service_area_main_pincode ? updateCri['service_area_main_pincode'] = service_area_main_pincode : ''
        service_area_secondary_pincode ? updateCri['service_area_secondary_pincode'] = service_area_secondary_pincode : ''


        address_details_permanent?.address_line ? updateCri['address_details_permanent.address_line'] = address_details_permanent?.address_line : ''
        address_details_permanent?.city ? updateCri['address_details_permanent.city'] = address_details_permanent?.city : ''
        address_details_permanent?.state ? updateCri['address_details_permanent.state'] = address_details_permanent?.state : ''
        address_details_permanent?.pincode ? updateCri['address_details_permanent.pincode'] = address_details_permanent?.pincode : ''
        address_details_permanent?.additional_pincode ? updateCri['address_details_permanent.additional_pincode'] = address_details_permanent?.additional_pincode : ''
        address_details_permanent?.short_code_for_place ? updateCri['address_details_permanent.short_code_for_place'] = address_details_permanent?.short_code_for_place : ''
        address_details_permanent?.country ? updateCri['address_details_permanent.country'] = address_details_permanent?.country : ''
        address_details_permanent?.google_geo_location ? updateCri['address_details_permanent.google_geo_location'] = address_details_permanent?.google_geo_location : ''

        address_details_temporary?.address_line ? updateCri['address_details_temporary.address_line'] = address_details_temporary?.address_line : ''
        address_details_temporary?.city ? updateCri['address_details_temporary.city'] = address_details_temporary?.city : ''
        address_details_temporary?.state ? updateCri['address_details_temporary.state'] = address_details_temporary?.state : ''
        address_details_temporary?.pincode ? updateCri['address_details_temporary.pincode'] = address_details_temporary?.pincode : ''
        address_details_temporary?.additional_pincode ? updateCri['address_details_temporary.additional_pincode'] = address_details_temporary?.additional_pincode : ''
        address_details_temporary?.short_code_for_place ? updateCri['address_details_temporary.short_code_for_place'] = address_details_temporary?.short_code_for_place : ''
        address_details_temporary?.country ? updateCri['address_details_temporary.country'] = address_details_temporary?.country : ''
        address_details_temporary?.google_geo_location ? updateCri['address_details_temporary.google_geo_location'] = address_details_temporary?.google_geo_location : ''

        engagement_type ? updateCri['engagement_type'] = engagement_type : ''

        document_details?.pan_card_document ? updateCri['document_details.pan_card_document'] = document_details?.pan_card_document : ''
        document_details?.pan_number ? updateCri['document_details.pan_number'] = document_details?.pan_number : ''
        document_details?.aadhar_card_document?.front_side ? updateCri['document_details.aadhar_card_document.front_side'] = document_details?.aadhar_card_document?.front_side : ''
        document_details?.aadhar_card_document.back_side ? updateCri['document_details.aadhar_card_document.back_side'] = document_details?.aadhar_card_document?.back_side : ''
        document_details?.aadhar_number ? updateCri['document_details.aadhar_number'] = document_details?.aadhar_number : ''
        document_details?.gstin_number ? updateCri['document_details.gstin_number'] = document_details?.gstin_number : ''

        referenceDetails?.reference_person_name ? updateCri['referenceDetails.reference_person_name'] = referenceDetails?.reference_person_name : ''
        referenceDetails?.reference_person_mobile ? updateCri['referenceDetails.reference_person_mobile'] = referenceDetails?.reference_person_mobile : ''

        emergency_details?.emergency_person_name ? updateCri['emergency_details.emergency_person_name'] = emergency_details?.emergency_person_name : ''
        emergency_details?.emergency_person_phone ? updateCri['emergency_details.emergency_person_phone'] = emergency_details?.emergency_person_phone : ''

        let updateCriCenter = {}

        let findCriCenter = {
            _id: {
                $in: req.technicianDetails?.center_id
            }
        }
        req.body.upi_id ? updateCriCenter['qr_details.qr_id'] = req.body.upi_id : ''
        req.body.annual_turnover ? updateCriCenter['annual_turnover'] = req.body.annual_turnover : ''
        req.body.clients_ids_list ? updateCriCenter['clients_ids_list'] = req.body.clients_ids_list : ''

        await centerDb.updateMany(findCriCenter, updateCriCenter, { new: true })

        await technicianDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Technician has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.getAllTechnicianCenter = async (req, res, next) => {
    try {
        let { skip, limit } = req.query
        let centerId = req.technicianDetails?.center_id || []
        let skipInter = parseInt(skip) || 0
        let limitInter = parseInt(limit) || 20

        let isAdminTechnician = req.technicianDetails?.is_technician_admin || false

        if (isAdminTechnician == false) {
            throw new Error("You dont have the rights to view technician list")

        }

        if (!(centerId.length > 0)) {
            throw new Error("You dont have any center associated to you")
        }

        let findCri = {
            center_id: {
                $in: centerId
            }
        }

        let technicianList = await technicianDb.find(findCri).skip(skipInter).limit(limitInter)
        let totalCount = await technicianDb.countDocuments(findCri)

        msg = "Data retrived Successfully"
        let data = technicianList
        actionCompleteResponsePagination(res, data, msg, totalCount)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.assignTechnician = async (req, res, next) => {
    try {
        let { ticket_obj_id, techncian_obj_id } = req.body
        let centerId = req.technicianDetails?.center_id || []

        let isAdminTechnician = req.technicianDetails?.is_technician_admin || false

        if (isAdminTechnician == false) {
            throw new Error("You dont have the rights to view technician list")

        }

        if (!(centerId.length > 0)) {
            throw new Error("You dont have any center associated to you")
        }

        let findCri = {
            _id: ticket_obj_id,
            "assigned_ids.assigned_center_id": {
                $in: centerId
            },
            ticket_status: {
                $ne: ticketStatus.CLOSED
            }
        }

        let ticketDetails = await ticketDb.findOne(findCri)

        if (!ticketDetails) {
            throw new Error("No ticket details exists with this ceiteria")
        }

        let updateCriteria = {
            "assigned_ids.assigned_technician_id": techncian_obj_id
        }

        let updaedDetais = await ticketDb.findOneAndUpdate(findCri, updateCriteria, { new: true })

        msg = "Your ticket is assigned";
        let resData = {
            updaedDetais
        };
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getUserDetails = async (req, res, next) => {
    try {
        let technicianId = req.technicianDetails?._id

        let findCriteria = {
            _id: technicianId
        }

        let userDetails = await technicianDb.findOne(findCriteria).populate('center_id')
            .populate('services.primary_services')
            .populate('services.secondary_services.secondary_services_id')

        msg = "Data retrived Successfully"
        let resData = {
            userDetails
        };
        actionCompleteResponse(res, resData, msg);




    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.createNewTicket = async (req, res, next) => {
    try {
        let { service_provided_for, specific_requirement, personal_details, address_details
            , time_preference, offers_applied, authorized_client_id } = req.body

        let centerDetails = req.technicianDetails?.center_id?.[0]

        let insertObj = {
            service_provided_for,
            specific_requirement,
            personal_details,
            time_preference,
            offers_applied,
            address_details
        }


        insertObj.ticket_created_by = ticketCreatedBy.CENTER
        insertObj.created_by = req.centerDetails?._id

        let sequenceForTicket = await counterHelper.getNextSequenceValue(sequence_generator.TICKET)

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

        let doesClientExists = await clientDb.findOne({ _id: authorized_client_id })

        if (doesClientExists) {
            let shortCode = doesClientExists.short_code || ""

            newdate = "T" + shortCode + '' + newdate
        } else {
            newdate = "T" + "IN" + '' + newdate

        }

        insertObj = {
            ...insertObj,
            ticket_id: newdate
        }

        let resData = await new ticketDb(insertObj).save()

        resData = JSON.parse(JSON.stringify(resData))

        console.log(req.centerDetails, "req.centerDetails")

        await centerServices.broadCastAllTicketsV1(req.centerDetails?._id, resData)

        msg = "Ticket created successfully"
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }

}


exports.createNewTechnician = async (req, res, next) => {
    try {
        let { personal_details, primary_services, secondary_services, service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, emergency_details,
            document_details, referenceDetails, is_salaried } = req.body

        let centerDetails = req.technicianDetails?.center_id?.[0]



        let totalNoOfTechnicianCanBeCreated = req.centerDetails.no_of_technicians

        let createdTechnician = await centerServices.getTotalNoOfTechnicianInACenter(req.centerDetails._id)

        if (!(createdTechnician < totalNoOfTechnicianCanBeCreated)) {
            throw new Error("already reached maximum of technician to create ! contact admin")
        }

        let { phone } = personal_details
        let { country_code, mobile_number } = phone

        // await centerServices.checkIfTechnicianAlreadyExists(country_code, mobile_number)

        let findCriteria = {
            "personal_details.phone.country_code": country_code,
            "personal_details.phone.mobile_number": mobile_number,
        }


        let technicianExists = await technicianDb.find(findCriteria).limit(1).exec()

        console.log(technicianExists, "technicianExists")
        if (technicianExists && Array.isArray(technicianExists) && technicianExists.length) {
            let technicianFound = technicianExists[0];
            let technicianEngagementType = technicianFound.engagement_type;

            if (technicianEngagementType === engagementType.SALARIED) {
                throw new Error("You can't add this technician. Already part of another center");
            }

            if (technicianEngagementType === engagementType.FREELANCER) {

                let request_type = "FOR_FREELANCER"
                let addedBy = "CENTER_ADMIN";

                await centerServices.sendRequestToTechnician(technicianFound, request_type, req.centerDetails._id, addedBy, technicianFound._id, req.technicianDetails?._id);

            }
        } else {

            let centerExists = await centerDb.find(findCriteria).limit(1).exec()

            let reqFindCri = {
                "technicianDetails.personal_details.phone.country_code": country_code,
                "technicianDetails.personal_details.phone.mobile_number": mobile_number,
            }
            let requestExists = await requestTechnicianModel.find(reqFindCri).limit(1).exec()

            console.log(centerExists, "centerExists")
            if (centerExists && Array.isArray(centerExists) && centerExists.length) {
                throw new Error("Center is already created");
            }

            if (requestExists && Array.isArray(requestExists) && requestExists.length) {
                throw new Error("Request is already sent");
            }

            let insertObj = {
                personal_details,
                services: {
                    primary_services,
                    secondary_services
                },
                service_area_main_pincode,
                service_area_secondary_pincode, address_details_permanent,
                address_details_temporary, engagement_type, document_details, referenceDetails,
                center_id: [req.centerDetails?._id],
                profile_created_by: profileCreatedBy?.CENTER,
                emergency_details,
                is_salaried
            }

            let request_type = "";

            if (engagement_type === engagementType.SALARIED) {
                request_type = "FOR_SALARIED";

            } else if (engagement_type === engagementType.FREELANCER) {
                request_type = "FOR_FREELANCER"
            }

            let addedBy = "CENTER_ADMIN";
            await centerServices.sendRequestToTechnician(insertObj, request_type, req.centerDetails._id, addedBy, "", req.technicianDetails?._id);

            await new technicianDb(insertObj).save()

            if (engagement_type === engagementType.FREELANCER) {

                let sequenceForCenter = await counterHelper.getNextSequenceValue(sequence_generator.CENTER)

                let no_of_technicians = 1;
                let insertObjCenter = {
                    personal_details,
                    address_details: address_details_permanent,
                    services: {
                        primary_services: primary_services,
                        secondary_services: secondary_services
                    },
                    center_name: personal_details.name,
                    no_of_technicians,
                    qr_details: {
                        qr_id: "INA" + sequenceForCenter
                    }
                }

                insertObjCenter = centerServices.getInsertObjBasedOnNoOfTechnicain(insertObjCenter, no_of_technicians)

                insertObjCenter.profile_created_by = profileCreatedBy.SELF_BY_APP

                await new centerDb(insertObjCenter).save()

            }


        }

        let resData = {};

        msg = "Technician created successfully"
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}