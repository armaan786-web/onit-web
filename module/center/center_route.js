const express = require('express');
const router = express.Router();

const centerController = require('./center_controller');
const centerValidator = require('./center_validator');
const validate = require('../../middleware/validate');

const verifyJwt = require("../../middleware/jwt");

router.post('/public-ticket-booking', validate(centerValidator.PublicTicketBooking), centerController.PublicTicketBooking);

router.post('/public-ticket-booking-paid', validate(centerValidator.PublicTicketBooking), centerController.PublicTicketBookingPaid);

router.post('/pay-public-ticket', validate(centerValidator.PublicTicketBookingPay), centerController.payPublicTicket)

router.get('/get-center-based-on-qr', centerController.getCenterBasedOnQr)

router.post('/register-center-via-web', validate(centerValidator.registerCenter), centerController.registerCenter);

router.post('/sent-otp', validate(centerValidator.sentotp), centerController.sentotp);

router.post('/update-profile-center', validate(centerValidator.updateProfileCenter), verifyJwt.verifyJwtToken, centerController.updateProfileCenter)

router.post('/verify-otp', validate(centerValidator.verifyOtp), centerController.verifyOtp);

router.post('/login-with-otp', validate(centerValidator.loginWithOtp), centerController.loginWithOtp)

router.post('/create-technician', validate(centerValidator.createTechnician), verifyJwt.verifyJwtToken, centerController.createTechnician)

router.get('/get-all-technician', validate(centerValidator.getAllTechnician), verifyJwt.verifyJwtToken, centerController.getAllTechnician)

router.post('/update-technician', validate(centerValidator.updateTechnician), verifyJwt.verifyJwtToken, centerController.updateTechnician)

router.post('/create-ticket', validate(centerValidator.createTicket), verifyJwt.verifyJwtToken, centerController.createTicket);

router.post('/close-ticket', validate(centerValidator.closeTicket), verifyJwt.verifyJwtToken, centerController.closeTicket);

router.get('/get-all-tickets-created-not-assigned', validate(centerValidator.getAllTicketsCreatedNotAssigned), verifyJwt.verifyJwtToken, centerController.getAllTicketsCreatedNotAssigned)

router.get('/get-all-ticket', validate(centerValidator.getAllTickets), verifyJwt.verifyJwtToken, centerController.getAllTickets);

router.post('/assigning-ticket-technician', validate(centerValidator.assignTicketTechnician), verifyJwt.verifyJwtToken, centerController.assignTicketTechnician);

router.post('/change-ticket-technician', validate(centerValidator.changeTicketTechnician), verifyJwt.verifyJwtToken, centerController.changeTicketTechnician);

router.post('/accepted-broadcast-request', validate(centerValidator.acceptBroadCastRequest), verifyJwt.verifyJwtToken, centerController.acceptBroadCastRequest)

router.post('/accepted-broadcast-request-unpaid-ticket', validate(centerValidator.acceptBroadcastUnPaidTicket), verifyJwt.verifyJwtToken, centerController.acceptBroadCastUnPaidTicket)

router.post('/accept-ticket-after-payment', validate(centerValidator.acceptTicketAfterPayment), verifyJwt.verifyJwtToken, centerController.acceptTicketAfterPayment)

router.get('/get-all-orders', validate(centerValidator.getAllOrders), verifyJwt.verifyJwtToken, centerController.getALLOrders)

router.post('/reject-broadCast-technician', validate(centerValidator.rejectBroadCastTicket), verifyJwt.verifyJwtToken, centerController.rejectBroadCastTicket)

router.get('/get-all-available-broadcast', validate(centerValidator.getAllAvailableBroadcastTicket), verifyJwt.verifyJwtToken, centerController.getAllAvailableBroadcastTicket)

router.post('/add-remarks-ticket', validate(centerValidator.addTicketRemarks), verifyJwt.verifyJwtToken, centerController.addTicketRemarks);

router.post('/register-center-send-otp-via-app', validate(centerValidator.registerCenterViaApp), centerController.registerCenterViaApp);

router.post('/verify-otp-via-app', validate(centerValidator.verifyOtpViaApp), centerController.verifyOtpViaApp);

module.exports = router;