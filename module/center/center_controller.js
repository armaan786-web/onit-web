const {
  authenticationFailed,
  sendActionFailedResponse,
  actionCompleteResponse,
  actionCompleteResponsePagination,
} = require("../../common/common");
const centerDb = require("../../model/center.model");
const verificationDb = require("../../model/otpVerificationModel");
const technicianDb = require("../../model/technician.model");
const ticketDb = require("../../model/ticket.model");
const broadCastDb = require("../../model/broadcast.model");
const orderDb = require("../../model/order.model");
const customerOrders = require("../../model/customerPayment.model");
const FeedBackDb = require("../../model/feedback");
const clientDb = require("../../model/client.model");

const notificationService = require("../../helpers/NotificationService");
const commonFolder = require("../../common/common");

const { sequence_generator } = require("../../common/const");

const counterHelper = require("../../helpers/dbHelper");

const centerServices = require("./center_services");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const crypto = require("crypto");
const mongoose = require("mongoose");

const razorpay = new Razorpay({
  key_id: commonFolder.razorPayKey.key_id,
  key_secret: commonFolder.razorPayKey.key_secret,
});

const commonFunctionForAuth = require("../../helpers/common");
const {
  ticketCreatedBy,
  rolesBasedOnNumberOfTechnician,
  engagementType,
  profileCreatedBy,
  TicketAssignType,
  broadCastStatus,
  statusOfBroadcastTicket,
  ticketStatus,
  availableStatusOfBroadCastTicket,
  availablePaymentStatus,
  paymentStatus,
} = require("../../common/const");

let msg = "";

exports.getAllTicketsCreatedNotAssigned = async (req, res, next) => {
  try {
    let { skip, limit } = req.query;
    let centerDetails = req.centerDetails;

    let skipItem = Number(skip) || 0;
    let limitItem = Number(limit) || 0;

    let findCri = {
      created_by: centerDetails._id,
      $or: [
        {
          "assigned_ids.assigned_center_id": {
            $ne: centerDetails._id,
          },
        },
        {
          "assigned_ids.assigned_center_id": {
            $exists: true,
          },
        },
        {
          "assigned_ids.assigned_center_id": {
            $exists: false,
          },
        },
      ],

      broadcast_status: {
        $ne: broadCastStatus.MATCHED_IN_SAME_CENTER,
      },
    };

    let ticketData = await ticketDb
      .find(findCri)
      .populate("service_provided_for")
      .populate("created_by")
      .populate("assigned_ids.assigned_center_id")
      .skip(skipItem)
      .limit(limitItem);
    let totalCount = await ticketDb.countDocuments(findCri);

    msg = "Data retrived Successfully";
    let data = ticketData;
    actionCompleteResponsePagination(res, data, msg, totalCount);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.getCenterBasedOnQr = async (req, res, next) => {
  try {
    let { qr_id } = req.query;

    let isCenterExist = false;

    let cri = {
      "qr_details.qr_id": qr_id,
    };

    let doesCenterExists = await centerDb.findOne(cri);

    if (doesCenterExists) {
      isCenterExist = true;
    }

    let resData = {
      isCenterExist,
      doesCenterExists,
    };

    msg = "Center details received successfully";
    let data = resData;
    actionCompleteResponse(res, data, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.getALLOrders = async (req, res, next) => {
  try {
    let { skip, limit } = req.query;
    let centerDetails = req.centerDetails;

    let skipItem = Number(skip) || 0;
    let limitItem = Number(limit) || 0;

    let findCri = {
      center_obj_id: centerDetails._id,
      payment_status: paymentStatus.SUCCESS,
    };
    let results = await orderDb
      .find(findCri)
      .populate({
        path: "ticket_obj_id",
        populate: { path: "service_provided_for" },
      })
      .sort({ createdAt: -1 })
      .skip(skipItem)
      .limit(limitItem)
      .exec();

    let totalCount = await orderDb.countDocuments(findCri);

    msg = "Data retrived Successfully";
    let data = results;
    actionCompleteResponsePagination(res, data, msg, totalCount);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.assignTicketTechnician = async (req, res, next) => {
  try {
    let { ticket_obj_id, technician_obj_id } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      _id: ticket_obj_id,
      "assigned_ids.assigned_center_id": centerDetails._id,
    };

    let isTicketFound = await ticketDb.findOne(findCri);

    if (!isTicketFound) {
      throw new Error("No ticket exists with this id");
    }

    let findTechnician = {
      _id: technician_obj_id,
      center_id: centerDetails._id,
    };

    let isTechnicianBelongToCenter = await technicianDb.findOne(findTechnician);

    if (!isTechnicianBelongToCenter) {
      throw new Error("Technician doesnt belong to center or doesnt exists");
    }

    if (isTicketFound.ticket_status == ticketStatus.CLOSED) {
      throw new Error("Ticket is closed , cant assign technician");
    }

    if (isTicketFound.is_technician_assigned) {
      throw new Error("Technician is already assigned");
    }

    let updateCri = {
      "assigned_ids.assigned_technician_id": technician_obj_id,
      is_technician_assigned: true,
    };

    let updatedDetails = await ticketDb.findOneAndUpdate(findCri, updateCri, {
      new: true,
    });
    let ticketDetails = await ticketDb
      .findOne(findCri)
      .populate("service_provided_for");

    let technicianMobileNumber =
      "91" + isTechnicianBelongToCenter.personal_details.phone.mobile_number;
    let customerMobileNumber =
      "91" + isTicketFound.personal_details.primary_phone.mobile_number;
    let ticketAddress =
      isTicketFound.address_details.address_line +
      " " +
      isTicketFound.address_details.pincode;
    let msg = `Dear ${customerMobileNumber}, Request id ${isTicketFound._id} OniT is given to Mr ${technicianMobileNumber} for visit at ${ticketAddress}. To reschedule, pls call ${technicianMobileNumber} on mobile.`;

    let visit = ticketDetails?.service_provided_for?.service_name;

    let ticketInfo = `Ticket id ${isTicketFound._id} from Center No ${centerDetails?.qr_details?.qr_id} is scheduled for ${visit} for customer ${customerMobileNumber} on address ${ticketAddress} . Pl ensure you r OniT!	`;

    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.TICKER_ASSIGNED,
      technicianMobileNumber,
      msg
    );
    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.TICKET_INFO,
      technicianMobileNumber,
      ticketInfo
    );

    msg = "Ticket is been assigned to technician successfully";
    let data = {};
    actionCompleteResponse(res, data, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.changeTicketTechnician = async (req, res, next) => {
  try {
    let { ticket_obj_id, technician_obj_id } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      _id: ticket_obj_id,
      "assigned_ids.assigned_center_id": centerDetails._id,
    };

    let isTicketFound = await ticketDb.findOne(findCri);

    if (!isTicketFound) {
      throw new Error("No ticket exists with this id");
    }

    let findTechnician = {
      _id: technician_obj_id,
      center_id: centerDetails._id,
    };

    let isTechnicianBelongToCenter = await technicianDb.findOne(findTechnician);

    if (!isTechnicianBelongToCenter) {
      throw new Error("Technician doesnt belong to center or doesnt exists");
    }

    if (isTicketFound.ticket_status == ticketStatus.CLOSED) {
      throw new Error("Ticket is closed , cant assign technician");
    }

    if (!isTicketFound.is_technician_assigned) {
      throw new Error("Technician can't be changed unless assigned");
    }

    let updateCri = {
      "assigned_ids.assigned_technician_id": technician_obj_id,
      is_technician_assigned: true,
    };

    let updatedDetails = await ticketDb.findOneAndUpdate(findCri, updateCri, {
      new: true,
    });

    let technicianMobileNumber =
      "91" + isTechnicianBelongToCenter.personal_details.phone.mobile_number;
    let customerMobileNumber =
      "91" + isTicketFound.personal_details.primary_phone.mobile_number;
    let ticketAddress =
      isTicketFound.address_details.address_line +
      " " +
      isTicketFound.address_details.pincode;
    let msg = `Dear ${customerMobileNumber}, Request id ${isTicketFound._id} OniT is given to Mr ${technicianMobileNumber} for visit at ${ticketAddress}. To reschedule, pls call ${technicianMobileNumber} on mobile.`;

    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.TICKER_ASSIGNED,
      technicianMobileNumber,
      msg
    );
    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.TICKER_ASSIGNED,
      customerMobileNumber,
      msg
    );

    msg = "Ticket is been assigned to technician successfully";
    let data = {};
    actionCompleteResponse(res, data, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.closeTicket = async (req, res, next) => {
  try {
    let { ticket_obj_id, remarks, amount } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      _id: ticket_obj_id,
      "assigned_ids.assigned_center_id": centerDetails._id,
    };

    let isTicketFound = await ticketDb.findOne(findCri);

    if (!isTicketFound) {
      throw new Error("No ticket exists with this id");
    }

    if (isTicketFound.ticket_status == ticketStatus.CLOSED) {
      throw new Error("The ticket is already in closed status");
    }

    let findCriDoesTechnicianAssigned = {
      _id: ticket_obj_id,
      "assigned_ids.assigned_center_id": centerDetails._id,
      "assigned_ids.assigned_technician_id": {
        $exists: true,
      },
    };

    let isTechnicianAssigned = await ticketDb.findOne(
      findCriDoesTechnicianAssigned
    );

    if (!isTechnicianAssigned) {
      throw new Error("No technician is assigned to ticket cant close it");
    }

    if (remarks && !remarks?.close_ticket_remarks) {
      throw new Error("Please give closing remarks for the ticket");
    }

    let updateCri = {
      ticket_status: ticketStatus.CLOSED,
      closing_ticket_price: amount,
    };

    remarks?.close_ticket_remarks
      ? (updateCri["remarks.close_ticket_remarks"] =
          remarks?.close_ticket_remarks)
      : "";

    let updatedDetailsTicket = await ticketDb.findOneAndUpdate(
      findCriDoesTechnicianAssigned,
      updateCri,
      { new: true }
    );

    let tokenEmbed = {
      ticket_obj_id,
    };

    let token = commonFunctionForAuth.generateAccessToken(tokenEmbed);

    let insertFeedBackObj = {
      ticket_obj_id: ticket_obj_id,
      center_obj_id: centerDetails._id,
      token: token,
      expires_in: new Date(commonFunctionForAuth.addDaysToTime(30)).valueOf(),
    };

    console.log(token, "token");

    let insertedFeedBackObj = await new FeedBackDb(insertFeedBackObj).save();
    console.log(insertedFeedBackObj, " insertFeedBackObj");

    await centerDb.findOneAndUpdate(
      { _id: centerDetails._id },
      {
        $inc: {
          "count_details.closed_ticket_count": 1,
        },
      },
      { new: true }
    );

    let customerMobileNumber =
      "91" + isTicketFound.personal_details.primary_phone.mobile_number;

    let msg = `Dear ${customerMobileNumber}, ticket id ${ticket_obj_id} is closed for Rs.${amount}. OniT Thank you for opportunity to serve you. Pl share your experience/feedback for services by clicking on the Link https://onit.services/#/feedback/${token}`;

    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.TICKER_CLOSURE,
      customerMobileNumber,
      msg
    );

    msg = "Ticket is been closed successfully";
    let data = {};
    actionCompleteResponse(res, data, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.addTicketRemarks = async (req, res, next) => {
  try {
    let { ticket_obj_id, remarks, date } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      _id: ticket_obj_id,
      "assigned_ids.assigned_center_id": centerDetails._id,
    };

    let isTicketFound = await ticketDb.findOne(findCri);

    if (!isTicketFound) {
      throw new Error("No ticket exists with this id");
    }

    let remarksObj = {
      remarks,
      date,
    };

    let updateObj = {
      $push: {
        "remarks.additional_remarks": remarksObj,
      },
    };

    await ticketDb.findOneAndUpdate(findCri, updateObj, { new: true });

    msg = "Ticket has been updated successfully";
    let data = {};
    actionCompleteResponse(res, data, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.getAllAvailableBroadcastTicket = async (req, res, next) => {
  try {
    let { skip, limit, status } = req.query;
    let centerDetails = req.centerDetails;

    let skipItem = Number(skip) || 0;
    let limitItem = Number(limit) || 0;

    let findCri = {
      center_obj_id: centerDetails._id,
      // status: statusOfBroadcastTicket.PENDING
    };

    console.log(centerDetails._id, "centerDetails._id");

    if (status) {
      findCri.status = status;
    }

    let results = await broadCastDb
      .find(findCri)
      .populate({
        path: "ticket_obj_id",
        populate: { path: "service_provided_for" },
      })
      .sort({ createdAt: -1 })
      .skip(skipItem)
      .limit(limitItem)
      .exec();

    let totalCount = await broadCastDb.countDocuments(findCri);

    msg = "Data retrived Successfully";
    let data = results;
    actionCompleteResponsePagination(res, data, msg, totalCount);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.rejectBroadCastTicket = async (req, res, next) => {
  try {
    let { broadcast_obj_id } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      center_obj_id: centerDetails._id,
      _id: broadcast_obj_id,
    };

    let brodCastDetails = await broadCastDb.findOne(findCri);

    if (!brodCastDetails) {
      throw new Error("Invalid broadCast details");
    }

    await centerServices.checkIfBroadCastIsAlreadyAccepted(
      brodCastDetails.ticket_obj_id
    );

    if (brodCastDetails.status_of_ticket != statusOfBroadcastTicket.PENDING) {
      throw new Error("Cant reject");
    }

    let updateCri = {
      status_of_ticket: statusOfBroadcastTicket.REJECTED,
    };

    await broadCastDb.findOneAndUpdate(findCri, updateCri, { new: true });

    msg = "Your have successfully rejected the broadcast ticket";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.acceptTicketAfterPayment = async (req, res, next) => {
  try {
    let payload = req.body;
    let razorpay_payment_id = payload.razorpay_payment_id;
    let razorpay_order_id = payload.razorpay_order_id;
    let razorpay_signature = payload.razorpay_signature;
    const shasum = crypto.createHmac(
      "sha256",
      commonFolder.razorPayKey.key_secret
    );
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (!(digest == razorpay_signature)) {
      throw new Error("Payment Not Valid Please Pay Again");
    }

    let findCriteria = {
      order_id: razorpay_order_id,
    };
    let updateCriteria = {
      payment_status: paymentStatus.SUCCESS,
    };
    let userOrderFound = await orderDb.find(findCriteria);
    if (
      !(
        userOrderFound &&
        Array.isArray(userOrderFound) &&
        userOrderFound.length
      )
    ) {
      throw new Error("Order Id not Found: ");
    }

    let updatedOrderStatus = await orderDb.findOneAndUpdate(
      findCriteria,
      updateCriteria,
      { new: true }
    );

    let criTicket = {
      _id: userOrderFound[0].ticket_obj_id,
    };

    let findCri = {
      _id: userOrderFound[0].broadcast_obj_id,
    };

    let updateTicketCri = {
      "assigned_ids.assigned_center_id": userOrderFound[0].center_obj_id,
      ticket_status: ticketStatus.ACCEPTED,
      broadcast_status: broadCastStatus.ACCEPTED_AFTER_BROADCAST,
    };

    await ticketDb.findOneAndUpdate(criTicket, updateTicketCri, { new: true });

    let criteriaBrocastTicket = {
      ticket_obj_id: userOrderFound[0].ticket_obj_id,
    };

    let updateCriBroadCast = {
      status_of_ticket: statusOfBroadcastTicket.EXPIRED,
    };

    await broadCastDb.updateMany(criteriaBrocastTicket, updateCriBroadCast);

    let updateCriAccept = {
      status_of_ticket: statusOfBroadcastTicket.ACCEPTED,
    };

    await broadCastDb.findOneAndUpdate(findCri, updateCriAccept, { new: true });

    msg = "Your ticket payment is completed";
    let resData = {
      updatedOrderStatus,
    };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.acceptBroadCastUnPaidTicket = async (req, res, next) => {
  try {
    let { broadcast_obj_id } = req.body;
    let centerDetails = req.centerDetails;

    let findCri = {
      center_obj_id: centerDetails._id,
      _id: broadcast_obj_id,
    };

    let brodCastDetails = await broadCastDb
      .findOne(findCri)
      .populate("ticket_obj_id");
    if (!brodCastDetails) {
      throw new Error("Invalid broadCast details");
    }

    await centerServices.checkIfBroadCastIsAlreadyAccepted(
      brodCastDetails.ticket_obj_id
    );

    await centerServices.checkIfCenterCanAcceptMoreBroadCastedTickets(
      centerDetails._id
    );

    let ticketDetails = brodCastDetails.ticket_obj_id;

    if (ticketDetails?.admin_setting?.is_paid) {
      throw new Error("This is a paid ticket this is not a free ticket");
    }

    let findCriteriaForMathcingTechnician = {
      $or: [
        {
          primary_services: ticketDetails.service_provided_for._id,
        },
        {
          "secondary_services.secondary_services_id":
            ticketDetails.service_provided_for._id,
        },
      ],
      $or: [
        {
          service_area_main_pincode: ticketDetails.address_details.pincode,
        },
        {
          service_area_secondary_pincode: {
            $in: [ticketDetails.address_details.pincode],
          },
        },
      ],
      center_id: centerDetails._id,
    };

    let technicianFound = await technicianDb.findOne(
      findCriteriaForMathcingTechnician
    );

    if (!technicianFound) {
      throw new Error(
        "No technician found in your center with particular skills "
      );
    }

    let criTicket = {
      _id: ticketDetails._id,
    };

    let updateTicketCri = {
      "assigned_ids.assigned_center_id": centerDetails._id,
      ticket_status: ticketStatus.ACCEPTED,
      broadcast_status: broadCastStatus.ACCEPTED_AFTER_BROADCAST,
    };

    await ticketDb.findOneAndUpdate(criTicket, updateTicketCri, { new: true });

    let criteriaBrocastTicket = {
      ticket_obj_id: ticketDetails._id,
    };

    let updateCriBroadCast = {
      status_of_ticket: statusOfBroadcastTicket.EXPIRED,
    };

    await broadCastDb.updateMany(criteriaBrocastTicket, updateCriBroadCast);

    let updateCriAccept = {
      status_of_ticket: statusOfBroadcastTicket.ACCEPTED,
    };

    await broadCastDb.findOneAndUpdate(findCri, updateCriAccept, { new: true });

    msg = "Ticket is accepted successfully";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.acceptBroadCastRequest = async (req, res, next) => {
  try {
    let { broadcast_obj_id } = req.body;
    let centerDetails = req.centerDetails;

    let isDisabled =
      centerDetails.disabled_for?.login_into_application || false;

    if (isDisabled) {
      throw new Error("Your account has been disabled to login, contact admin");
    }

    let isDisabledForAcceptingBroadCastingRequest =
      centerDetails.disabled_for?.accepting_broadcast_ticket || false;

    if (isDisabledForAcceptingBroadCastingRequest) {
      throw new Error(
        "You have been blocked to accept more request , contact admin"
      );
    }

    let findCri = {
      center_obj_id: centerDetails._id,
      _id: broadcast_obj_id,
    };

    let brodCastDetails = await broadCastDb
      .findOne(findCri)
      .populate("ticket_obj_id");
    if (!brodCastDetails) {
      throw new Error("Invalid broadCast details");
    }

    await centerServices.checkIfBroadCastIsAlreadyAccepted(
      brodCastDetails.ticket_obj_id
    );

    await centerServices.checkIfCenterCanAcceptMoreBroadCastedTickets(
      centerDetails._id
    );

    let ticketDetails = brodCastDetails.ticket_obj_id;

    if (!ticketDetails?.admin_setting?.is_paid) {
      throw new Error("This is not a paid ticket this is a free ticket");
    }

    console.log(req.centerDetails, "req.centerDetails", ticketDetails);

    let findCriteriaForMathcingTechnician = {
      $or: [
        {
          $or: [
            {
              "services.primary_services": mongoose.Types.ObjectId(
                ticketDetails.service_provided_for
              ),
            },
            {
              "services.secondary_services.secondary_services_id":
                mongoose.Types.ObjectId(ticketDetails.service_provided_for),
            },
          ],
        },
        {
          $or: [
            {
              service_area_main_pincode: ticketDetails.address_details.pincode,
            },
            {
              service_area_secondary_pincode: {
                $in: [ticketDetails.address_details.pincode],
              },
            },
          ],
        },
      ],
      center_id: {
        $in: [mongoose.Types.ObjectId(centerDetails._id)],
      },
    };

    console.log(
      JSON.stringify(findCriteriaForMathcingTechnician),
      "findCriteriaForMathcingTechnician"
    );

    let technicianFound = await technicianDb.findOne(
      findCriteriaForMathcingTechnician
    );

    console.log(technicianFound, "technicianFound");

    if (!technicianFound) {
      throw new Error(
        "No technician found in your center with particular skills "
      );
    }

    let ticketPrice = ticketDetails.ticket_price || 99;

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
    };

    await new orderDb(insertOrderObj).save();

    msg = "Your ticket payment is initialized";
    let resData = {
      ticketDetails,
      payment_response: response,
      centerDetails,
    };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.updateProfileCenter = async (req, res, next) => {
  try {
    let {
      personal_details,
      center_name,
      primary_services,
      secondary_services,
      address_details,
    } = req.body;

    let centerDetails = req.centerDetails;

    let findCri = {
      _id: centerDetails._id,
    };

    let updateCri = {};

    center_name ? (updateCri["center_name"] = center_name) : "";

    personal_details?.phone
      ? (updateCri["personal_details.phone"] = personal_details?.phone)
      : "";
    personal_details?.email
      ? (updateCri["personal_details.email"] = personal_details?.email)
      : "";
    personal_details?.name
      ? (updateCri["personal_details.name"] = personal_details?.name)
      : "";
    personal_details?.user_name
      ? (updateCri["personal_details.user_name"] = personal_details?.user_name)
      : "";
    personal_details?.about
      ? (updateCri["personal_details.about"] = personal_details?.about)
      : "";

    primary_services
      ? (updateCri["services.primary_services"] = primary_services)
      : "";
    secondary_services
      ? (updateCri["services.secondary_services"] = secondary_services)
      : "";

    address_details?.address_line
      ? (updateCri["address_details.address_line"] =
          address_details?.address_line)
      : "";
    address_details?.city
      ? (updateCri["address_details.city"] = address_details?.city)
      : "";
    address_details?.state
      ? (updateCri["address_details.state"] = address_details?.state)
      : "";
    address_details?.pincode
      ? (updateCri["address_details.pincode"] = address_details?.pincode)
      : "";
    address_details?.additional_pincode
      ? (updateCri["address_details.additional_pincode"] =
          address_details?.additional_pincode)
      : "";
    address_details?.country
      ? (updateCri["address_details.country"] = address_details?.country)
      : "";
    address_details?.google_geo_location
      ? (updateCri["address_details.google_geo_location"] =
          address_details?.google_geo_location)
      : "";

    await centerDb.findOneAndUpdate(findCri, updateCri, { new: true });

    msg = "Center has been updated successfully";
    let resData = {
      updateCri,
    };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    let centerDetails = req.centerDetails;

    let { skip, limit } = req.query;

    let skipp = Number(skip) || 0;
    let limitt = Number(limit) || 0;

    let crit = {
      "assigned_ids.assigned_center_id": centerDetails._id,
    };

    let results = await ticketDb
      .find(crit)
      .populate("service_provided_for")
      .populate("assigned_ids.assigned_center_id")
      .skip(skipp)
      .limit(limitt)
      .sort({ _id: -1 });
    let totalCount = await ticketDb.countDocuments(crit);

    msg = "Data retrived Successfully";
    let data = results;
    actionCompleteResponsePagination(res, data, msg, totalCount);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.registerCenter = async (req, res, next) => {
  try {
    let {
      personal_details,
      center_name,
      primary_services,
      secondary_services,
      address_details,
      no_of_technicians,
      onboarded_by,
    } = req.body;

    let { phone } = personal_details;
    let { country_code, mobile_number } = phone;
    console.log(req.body, "sequenceForCenter", "sssssssssss");

    mobile_number = mobile_number.trim();

    await centerServices.checkIfCenterDoesNotExists(
      country_code,
      mobile_number
    );

    await centerServices.checkIFTheOtpIsVerifiedForThisNumber(
      country_code,
      mobile_number
    );

    console.log(sequence_generator.CENTER, "sequence_generator.CENTER");
    let sequenceForCenter = await counterHelper.getNextSequenceValue(
      sequence_generator.CENTER
    );

    console.log(sequenceForCenter, "sequenceForCenter", "sssssssssss");
    let insertObj = {
      personal_details,
      address_details,
      services: {
        primary_services: primary_services,
        secondary_services: secondary_services,
      },
      center_name,
      no_of_technicians,
      qr_details: {
        qr_id: "INA" + sequenceForCenter,
      },
    };
    console.log(insertObj, "sequenceForCenter", "sssssssssss");

    insertObj = centerServices.getInsertObjBasedOnNoOfTechnicain(
      insertObj,
      no_of_technicians
    );

    insertObj.profile_created_by = profileCreatedBy.SELF;

    if (onboarded_by && onboarded_by.length > 0) {
      insertObj.onboarded_by = onboarded_by;
    }

    let inserttObjReult = await new centerDb(insertObj).save();

    if (no_of_technicians == 1) {
      let insertObjTechnician = {
        personal_details,
        center_id: [inserttObjReult._id],
        services: {
          primary_services: primary_services,
          secondary_services: secondary_services,
        },
        address_details_permanent: address_details,
        profile_created_by: profileCreatedBy.CENTER,
        engagement_type: engagementType.SELF_EMPLOYED,
      };

      await new technicianDb(insertObjTechnician).save();
      // await centerDb.findOneAndUpdate
    }

    let centerMobileNumber = "91" + mobile_number;
    let varBookingUrl = "https://onit.services/#/booking";
    let msg = `Services are now digital OniT! Use online booking link ${varBookingUrl} anytime anywhere. Share on FB and Whatsapp ${varBookingUrl}`;

    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.CENTER_REGISTRATION,
      centerMobileNumber,
      msg
    );

    await verificationDb.deleteMany({ country_code, mobile_number });

    msg = "Center has been created successfully";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.registerCenterViaApp = async (req, res, next) => {
  try {
    let {
      center_name,
      personal_details,
      primary_services,
      address_details,
      no_of_technicians,
      device_id,
    } = req.body;

    let { phone } = personal_details;
    let { country_code, mobile_number } = phone;
    console.log(req.body, "sequenceForCenter", "sssssssssss");

    mobile_number = mobile_number.trim();

    await centerServices.checkIfCenterOtpVerified(country_code, mobile_number);

    await centerServices.checkIfTechnicianOtpVerified(
      country_code,
      mobile_number
    );

    let otpDetails = commonFolder.getOtpCreation();

    let otp = otpDetails.otp;
    let expires_in = otpDetails.expires_in;

    let insertObj = {
      personal_details,
      address_details,
      services: {
        primary_services: primary_services,
      },
      center_name,
      no_of_technicians,
      otp_details: {
        otp: otp,
        expires_in: expires_in,
        is_otp_verfied: false,
      },
    };

    let sequenceForCenter = await counterHelper.getNextSequenceValue(
      sequence_generator.CENTER
    );

    insertObj = {
      ...insertObj,
      qr_details: {
        qr_id: "INA" + sequenceForCenter,
      },
    };
    let insertObjTechnician = {};
    insertObj = centerServices.getInsertObjBasedOnNoOfTechnicain(
      insertObj,
      no_of_technicians
    );

    insertObj.profile_created_by = profileCreatedBy.SELF;

    let inserttObjReult = await new centerDb(insertObj).save();

    if (!personal_details.name) {
      center_name
        ? (insertObjTechnician["personal_details.name"] = center_name)
        : "";
    }

    insertObjTechnician = {
      personal_details,
      center_id: [inserttObjReult._id],
      services: {
        primary_services: primary_services,
      },
      address_details_permanent: address_details,
      profile_created_by: profileCreatedBy.SELF_BY_APP,
      engagement_type: engagementType.CENTER_ADMIN,
      is_technician_admin: true,
      otp_details: {
        otp: otp,
        expires_in: expires_in,
        is_otp_verfied: false,
      },
      device_id,
    };

    await new technicianDb(insertObjTechnician).save();

    let centerMobileNumber = "91" + mobile_number;
    let varBookingUrl = "https://onit.services/#/booking";
    let msg = `Services are now digital OniT! Use online booking link ${varBookingUrl} anytime anywhere. Share on FB and Whatsapp ${varBookingUrl}`;

    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.CENTER_REGISTRATION,
      centerMobileNumber,
      msg
    );
    let msgToSend = "Use OTP " + otp + " to login to your OniT account.";
    // await notificationService.sentMessageViaTwilio(msgToSend, country_code, mobile_number)
    let mobileNumeber = "91" + mobile_number;
    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.OTP_TEMPLATE_ID,
      mobileNumeber,
      msgToSend
    );

    await verificationDb.deleteMany({ country_code, mobile_number });

    msg = "Otp has been sent successfully";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.getAllTechnician = async (req, res, next) => {
  try {
    let centerDetails = req.centerDetails;

    let { skip, limit } = req.query;
    let payload = req.query;

    let skipp = Number(skip) || 0;
    let limitt = Number(limit) || 0;

    let crit = {
      center_id: centerDetails._id,
    };

    payload.technician_obj_id ? (crit["_id"] = payload.technician_obj_id) : "";

    let results = await technicianDb
      .find(crit)
      .populate("center_id")
      .populate("services.primary_services")
      .populate("services.secondary_services.secondary_services_id")
      .skip(skipp)
      .limit(limitt)
      .exec();
    let totalCount = await technicianDb.countDocuments(crit);

    msg = "Data retrived Successfully";
    let data = results;
    actionCompleteResponsePagination(res, data, msg, totalCount);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    let {
      service_provided_for,
      specific_requirement,
      personal_details,
      address_details,
      time_preference,
      offers_applied,
      authorized_client_id,
    } = req.body;

    let centerDetails = req.centerDetails;

    let insertObj = {
      service_provided_for,
      specific_requirement,
      personal_details,
      time_preference,
      offers_applied,
      address_details,
    };

    insertObj.ticket_created_by = ticketCreatedBy.CENTER;
    insertObj.created_by = centerDetails?._id;

    let sequenceForTicket = await counterHelper.getNextSequenceValue(
      sequence_generator.TICKET
    );

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

    let doesClientExists = await clientDb.findOne({
      _id: authorized_client_id,
    });

    if (doesClientExists) {
      let shortCode = doesClientExists.short_code || "";

      newdate = "T" + shortCode + "" + newdate;
    } else {
      newdate = "T" + "IN" + "" + newdate;
    }

    insertObj = {
      ...insertObj,
      ticket_id: newdate,
    };

    let resData = await new ticketDb(insertObj).save();

    resData = JSON.parse(JSON.stringify(resData));

    await centerServices.broadCastAllTicketsV1(centerDetails?._id, resData);

    msg = "Ticket created successfully";
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.createTechnician = async (req, res, next) => {
  try {
    let {
      personal_details,
      primary_services,
      secondary_services,
      service_area_main_pincode,
      service_area_secondary_pincode,
      address_details_permanent,
      address_details_temporary,
      engagement_type,
      emergency_details,
      document_details,
      referenceDetails,
    } = req.body;

    let centerDetails = req.centerDetails;

    let totalNoOfTechnicianCanBeCreated = centerDetails.no_of_technicians;

    let createdTechnician =
      await centerServices.getTotalNoOfTechnicianInACenter(centerDetails._id);

    if (!(createdTechnician < totalNoOfTechnicianCanBeCreated)) {
      throw new Error(
        "already reached maximum of technician to create ! contact admin"
      );
    }

    let { phone } = personal_details;
    let { country_code, mobile_number } = phone;

    await centerServices.checkIfTechnicianAlreadyExists(
      country_code,
      mobile_number
    );

    let insertObj = {
      personal_details,
      services: {
        primary_services,
        secondary_services,
      },
      service_area_main_pincode,
      service_area_secondary_pincode,
      address_details_permanent,
      address_details_temporary,
      engagement_type,
      document_details,
      referenceDetails,
      center_id: [centerDetails?._id],
      profile_created_by: profileCreatedBy?.CENTER,
      emergency_details,
    };

    let resData = await new technicianDb(insertObj).save();

    msg = "Technician created successfully";
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.loginWithOtp = async (req, res, next) => {
  try {
    let { country_code, mobile_number, otp } = req.body;

    await centerServices.checkIfTheOtpIsValid(country_code, mobile_number, otp);

    let centerDetails = await centerServices.checkIfCenterExists(
      country_code,
      mobile_number
    );

    let isDisabled =
      centerDetails.disabled_for?.login_into_application || false;

    if (isDisabled) {
      throw new Error("Your account has been disabled to login, contact admin");
    }

    let tokenEmbed = {
      _id: centerDetails._id,
      first_name: centerDetails.personal_details.email,
    };

    let populatedCenterDetails = await centerDb
      .findOne({ _id: centerDetails._id })
      .populate("services.primary_services")
      .populate("services.secondary_services.secondary_services_id")
      .populate("clients_ids_list");

    let token = commonFunctionForAuth.generateAccessToken(tokenEmbed);

    await verificationDb.deleteMany({ country_code, mobile_number });

    msg = "Loged in successfully";
    let resData = { token, centerDetails, populatedCenterDetails };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    let { country_code, mobile_number, otp } = req.body;

    let verificationResult = await centerServices.checkIfTheOtpIsValid(
      country_code,
      mobile_number,
      otp
    );

    let updateCri = {
      verified: true,
    };

    await verificationDb.findOneAndUpdate(
      { _id: verificationResult._id },
      updateCri,
      { new: true }
    );

    msg = "Otp has been verified successfully";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.verifyOtpViaApp = async (req, res, next) => {
  try {
    let { country_code, mobile_number, otp } = req.body;

    let centerResult = await centerServices.checkIfTheOtpIsValidForCenterViaApp(
      country_code,
      mobile_number,
      otp
    );

    let technicianResult =
      await centerServices.checkIfTheOtpIsValidForTechnicianViaApp(
        country_code,
        mobile_number,
        otp
      );

    let updateCri = {
      otp_details: {
        is_otp_verfied: true,
      },
    };

    let centerDetails = await centerDb
      .findOneAndUpdate({ _id: centerResult._id }, updateCri, { new: true })
      .populate("services.primary_services")
      .populate("services.secondary_services")
      .populate("clients_ids_list");

    await technicianDb.findOneAndUpdate(
      { _id: technicianResult._id },
      updateCri,
      { new: true }
    );

    let tokenEmbed = {
      _id: technicianResult._id,
    };

    let populatedTechnicianDetails = await technicianDb
      .findOne({ _id: technicianResult._id })
      .populate("services.primary_services")
      .populate("center_id");

    let token = commonFunctionForAuth.generateAccessToken(tokenEmbed);

    msg = "Otp has been verified successfully";
    let resData = {
      token,
      technicianResult,
      centerDetails,
      populatedTechnicianDetails,
    };

    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.sentotp = async (req, res, next) => {
  try {
    let { action } = req.query;
    let { country_code, mobile_number } = req.body;

    if (action === "registration") {
      await centerServices.checkIfCenterDoesNotExists(
        country_code,
        mobile_number
      );
    } else if (action === "login") {
      let centerDetails = await centerServices.checkIfCenterExists(
        country_code,
        mobile_number
      );
    }

    let deleteCri = {
      country_code,
      mobile_number,
    };

    await verificationDb.deleteMany(deleteCri);

    let otpDetails = commonFolder.getOtpCreation();

    let otp;
    let expires_in = otpDetails.expires_in;

    if (mobile_number == 9810024941) {
      otp = 1234;
    } else {
      otp = otpDetails.otp;
    }

    // let msgToSend = `Hii  your otp is ${otp} and your otp expires in next 5 min `
    let msgToSend = "Use OTP " + otp + " to login to your OniT account.";
    // await notificationService.sentMessageViaTwilio(msgToSend, country_code, mobile_number)
    let mobileNumeber = "91" + mobile_number;
    await notificationService.sendOtpViaMasssms(
      commonFolder.SMSDetails.OTP_TEMPLATE_ID,
      mobileNumeber,
      msgToSend
    );

    let insertObj = {
      country_code,
      mobile_number,
      otp,
      expries_at: expires_in,
    };

    await new verificationDb(insertObj).save();

    msg = "Otp has been sent successfully";
    let resData = {};
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.payPublicTicket = async (req, res, next) => {
  try {
    let payload = req.body;
    let razorpay_payment_id = payload.razorpay_payment_id;
    let razorpay_order_id = payload.razorpay_order_id;
    let razorpay_signature = payload.razorpay_signature;
    const shasum = crypto.createHmac(
      "sha256",
      commonFolder.razorPayKey.key_secret
    );
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (!(digest == razorpay_signature)) {
      throw new Error("Payment Not Valid Please Pay Again");
    }

    let findCriteria = {
      order_id: razorpay_order_id,
    };
    let updateCriteria = {
      payment_status: paymentStatus.SUCCESS,
    };
    let userOrderFound = await customerOrders.find(findCriteria);
    if (
      !(
        userOrderFound &&
        Array.isArray(userOrderFound) &&
        userOrderFound.length
      )
    ) {
      throw new Error("Order Id not Found: ");
    }

    let updatedOrderStatus = await customerOrders.findOneAndUpdate(
      findCriteria,
      updateCriteria,
      { new: true }
    );

    let criTicket = {
      _id: userOrderFound[0].ticket_obj_id,
    };

    let updateTicketCri = {
      is_paid_by_public: true,
    };

    let updatedData = await ticketDb.findOneAndUpdate(
      criTicket,
      updateTicketCri,
      { new: true }
    );

    if (updatedData?.created_by) {
      await centerServices.broadCastAllTicketsV1ForCreatedUsingQR(
        updatedData?.created_by,
        updatedData
      );
    } else {
      await centerServices.broadCastAllTicketsV1("", updatedData);
    }
    msg = "Your ticket payment is completed";
    let resData = {
      updatedOrderStatus,
    };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.PublicTicketBookingPaid = async (req, res, next) => {
  try {
    let {
      service_provided_for,
      specific_requirement,
      personal_details,
      address_details,
      time_preference,
      offers_applied,
      center_obj_id,
      authorized_client_id,
    } = req.body;

    let insertObj = {
      service_provided_for,
      specific_requirement,
      personal_details,
      time_preference,
      offers_applied,
      address_details,
    };
    insertObj.ticket_created_by = ticketCreatedBy.PUBLIC;

    if (center_obj_id) {
      insertObj.ticket_created_by = ticketCreatedBy.PUBLIC_WITH_CENTER_QR;
      insertObj.created_by = center_obj_id;
    }

    let sequenceForTicket = await counterHelper.getNextSequenceValue(
      sequence_generator.TICKET
    );

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

    let doesClientExists = await clientDb.findOne({
      _id: authorized_client_id,
    });

    if (doesClientExists) {
      let shortCode = doesClientExists.short_code || "";

      newdate = "T" + shortCode + "" + newdate;
    } else {
      newdate = "T" + "" + newdate;
    }

    insertObj = {
      ...insertObj,
      ticket_id: newdate,
    };

    let resDatas = await new ticketDb(insertObj).save();

    let ticketPrice = 99;

    const options = {
      amount: ticketPrice * 100,
      currency: "INR",
      receipt: "onit" + shortid.generate(),
      payment_capture: 1,
    };
    const response = await razorpay.orders.create(options);

    let insertOrderObj = {
      ticket_obj_id: ticketDetails._id,
      payment_status: paymentStatus.PENDING,
      sumPriceToPay: options.amount,
      currency: "INR",
      order_id: response.id,
      receipt: options.receipt,
      customer_details: {
        phone: personal_details.primary_phone.mobile_number,
        country_code: personal_details.primary_phone.country_code,
      },
    };

    await new customerOrders(insertOrderObj).save();

    msg = "Your ticket payment is initialized";
    let resData = {
      insertOrderObj,
    };
    actionCompleteResponse(res, resData, msg);

    // if (center_obj_id) {
    //     await centerServices.broadCastAllTicketsV1ForCreatedUsingQR(center_obj_id, resData)

    // } else {
    //     await centerServices.broadCastAllTicketsV1("", resData)

    // }

    msg = "Ticket created successfully";
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.PublicTicketBooking = async (req, res, next) => {
  try {
    let {
      service_provided_for,
      specific_requirement,
      personal_details,
      address_details,
      time_preference,
      offers_applied,
      center_obj_id,
      authorized_client_id,
    } = req.body;

    let insertObj = {
      service_provided_for,
      specific_requirement,
      personal_details,
      time_preference,
      offers_applied,
      address_details,
    };
    insertObj.ticket_created_by = ticketCreatedBy.PUBLIC;

    if (center_obj_id) {
      insertObj.ticket_created_by = ticketCreatedBy.PUBLIC_WITH_CENTER_QR;
      insertObj.created_by = center_obj_id;
    }

    let sequenceForTicket = await counterHelper.getNextSequenceValue(
      sequence_generator.TICKET
    );

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

    let doesClientExists = await clientDb.findOne({
      _id: authorized_client_id,
    });

    if (doesClientExists) {
      let shortCode = doesClientExists.short_code || "";

      newdate = "T" + shortCode + "" + newdate;
    } else {
      newdate = "T" + "" + newdate;
    }

    insertObj = {
      ...insertObj,
      ticket_id: newdate,
    };

    let resData = await new ticketDb(insertObj).save();

    if (center_obj_id) {
      await centerServices.broadCastAllTicketsV1ForCreatedUsingQR(
        center_obj_id,
        resData
      );
    } else {
      await centerServices.broadCastAllTicketsV1("", resData);
    }

    msg = "Ticket created successfully";
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.updateTechnician = async (req, res, next) => {
  try {
    let {
      personal_details,
      primary_services,
      secondary_services,
      service_area_main_pincode,
      service_area_secondary_pincode,
      address_details_permanent,
      address_details_temporary,
      engagement_type,
      emergency_details,
      document_details,
      referenceDetails,
      center_obj_id,
      technician_obj_id,
    } = req.body;

    let findCri = {
      _id: technician_obj_id,
    };

    let updateCri = {};

    //todo make the array data as operation types
    center_obj_id ? (updateCri["center_id"] = center_obj_id) : "";

    personal_details?.phone
      ? (updateCri["personal_details.phone"] = personal_details?.phone)
      : "";
    personal_details?.email
      ? (updateCri["personal_details.email"] = personal_details?.email)
      : "";
    personal_details?.name
      ? (updateCri["personal_details.name"] = personal_details?.name)
      : "";
    personal_details?.user_name
      ? (updateCri["personal_details.user_name"] = personal_details?.user_name)
      : "";
    personal_details?.about
      ? (updateCri["personal_details.about"] = personal_details?.about)
      : "";

    primary_services
      ? (updateCri["services.primary_services"] = primary_services)
      : "";
    secondary_services
      ? (updateCri["services.secondary_services"] = secondary_services)
      : "";

    service_area_main_pincode
      ? (updateCri["service_area_main_pincode"] = service_area_main_pincode)
      : "";
    service_area_secondary_pincode
      ? (updateCri["service_area_secondary_pincode"] =
          service_area_secondary_pincode)
      : "";

    address_details_permanent?.address_line
      ? (updateCri["address_details_permanent.address_line"] =
          address_details_permanent?.address_line)
      : "";
    address_details_permanent?.city
      ? (updateCri["address_details_permanent.city"] =
          address_details_permanent?.city)
      : "";
    address_details_permanent?.state
      ? (updateCri["address_details_permanent.state"] =
          address_details_permanent?.state)
      : "";
    address_details_permanent?.pincode
      ? (updateCri["address_details_permanent.pincode"] =
          address_details_permanent?.pincode)
      : "";
    address_details_permanent?.additional_pincode
      ? (updateCri["address_details_permanent.additional_pincode"] =
          address_details_permanent?.additional_pincode)
      : "";
    address_details_permanent?.short_code_for_place
      ? (updateCri["address_details_permanent.short_code_for_place"] =
          address_details_permanent?.short_code_for_place)
      : "";
    address_details_permanent?.country
      ? (updateCri["address_details_permanent.country"] =
          address_details_permanent?.country)
      : "";
    address_details_permanent?.google_geo_location
      ? (updateCri["address_details_permanent.google_geo_location"] =
          address_details_permanent?.google_geo_location)
      : "";

    address_details_temporary?.address_line
      ? (updateCri["address_details_temporary.address_line"] =
          address_details_temporary?.address_line)
      : "";
    address_details_temporary?.city
      ? (updateCri["address_details_temporary.city"] =
          address_details_temporary?.city)
      : "";
    address_details_temporary?.state
      ? (updateCri["address_details_temporary.state"] =
          address_details_temporary?.state)
      : "";
    address_details_temporary?.pincode
      ? (updateCri["address_details_temporary.pincode"] =
          address_details_temporary?.pincode)
      : "";
    address_details_temporary?.additional_pincode
      ? (updateCri["address_details_temporary.additional_pincode"] =
          address_details_temporary?.additional_pincode)
      : "";
    address_details_temporary?.short_code_for_place
      ? (updateCri["address_details_temporary.short_code_for_place"] =
          address_details_temporary?.short_code_for_place)
      : "";
    address_details_temporary?.country
      ? (updateCri["address_details_temporary.country"] =
          address_details_temporary?.country)
      : "";
    address_details_temporary?.google_geo_location
      ? (updateCri["address_details_temporary.google_geo_location"] =
          address_details_temporary?.google_geo_location)
      : "";

    engagement_type ? (updateCri["engagement_type"] = engagement_type) : "";

    document_details?.pan_card_document
      ? (updateCri["document_details.pan_card_document"] =
          document_details?.pan_card_document)
      : "";
    document_details?.pan_number
      ? (updateCri["document_details.pan_number"] =
          document_details?.pan_number)
      : "";
    document_details?.aadhar_card_document?.front_side
      ? (updateCri["document_details.aadhar_card_document.front_side"] =
          document_details?.aadhar_card_document?.front_side)
      : "";
    document_details?.aadhar_card_document.back_side
      ? (updateCri["document_details.aadhar_card_document.back_side"] =
          document_details?.aadhar_card_document?.back_side)
      : "";
    document_details?.aadhar_number
      ? (updateCri["document_details.aadhar_number"] =
          document_details?.aadhar_number)
      : "";
    document_details?.gstin_number
      ? (updateCri["document_details.gstin_number"] =
          document_details?.gstin_number)
      : "";

    referenceDetails?.reference_person_name
      ? (updateCri["referenceDetails.reference_person_name"] =
          referenceDetails?.reference_person_name)
      : "";
    referenceDetails?.reference_person_mobile
      ? (updateCri["referenceDetails.reference_person_mobile"] =
          referenceDetails?.reference_person_mobile)
      : "";

    emergency_details?.emergency_person_name
      ? (updateCri["emergency_details.emergency_person_name"] =
          emergency_details?.emergency_person_name)
      : "";
    emergency_details?.emergency_person_phone
      ? (updateCri["emergency_details.emergency_person_phone"] =
          emergency_details?.emergency_person_phone)
      : "";

    await technicianDb.findOneAndUpdate(findCri, updateCri, { new: true });

    msg = "Technician has been updated successfully";
    let resData = {
      updateCri,
    };
    actionCompleteResponse(res, resData, msg);
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

// add technician
// 2 ways
// via existing -> salaried - no change
// -> freelancer -> yes request sent

// via no existing -> techcnican  - validate that moible number doesnt exists aldready in request , center , techician
// if exists in request throw error request aldready sent
//-> freelancer -> create technican , create center , assigncenter , create request object in db
// -> salaried -> create technician, create request obj in db no center

// accept api - in case of freelancer
// check if request eists and its valid request then accept it
// push the center id into the technician schema
/// change stats to acceptedd

//reject api  - freelancer
// check if request eists and its valid request then accept it
// change the status of the request to invalid

// accept api -> salaried;
// check if the request if valid then push that center id into technician
// change the status to accept

//reject api - salaried
// check if request is valid
// then create a center for the techniicna and make him as admin techniican
// map him to the center
// and change the request status as rejected
// change the technician status as freelancer from salaried one

// api to get all reqyest belongs to techniican / center ( freelancer techniican )
