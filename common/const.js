

exports.adminRoleType = {
	"SUPER_ADMIN": 'SUPER_ADMIN',
	"ACCOUNTANT": 'ACCOUNTANT',
	"MARKETING_TEAM": 'MARKETING_TEAM',
	"SUPERVISOR": 'SUPERVISOR'
}

exports.availableAdminRoleTypes = [
	this.adminRoleType.SUPER_ADMIN,
	this.adminRoleType.ACCOUNTANT,
	this.adminRoleType.MARKETING_TEAM,
	this.adminRoleType.SUPERVISOR
]

exports.statusOfBroadcastTicket = {
	"ACCEPTED": 'ACCEPTED',
	"REJECTED": 'REJECTED',
	"ACCEPTED_ALREADY": 'ACCEPTED_ALREADY',
	"PENDING": 'PENDING',
	"EXPIRED": 'EXPIRED',
}

exports.availableStatusOfBroadCastTicket = [
	this.statusOfBroadcastTicket.ACCEPTED,
	this.statusOfBroadcastTicket.REJECTED,
	this.statusOfBroadcastTicket.PENDING,
	this.statusOfBroadcastTicket.ACCEPTED_ALREADY
]

exports.TicketAssignType = {
	"CENTER": 'CENTER',
	"TECHNICIAN": 'TECHNICIAN',
	"FREELANCER_CENTER": 'patient payment'
}

exports.availableTicketAssignTypes = [
	this.TicketAssignType.CENTER,
	this.TicketAssignType.TECHNICIAN,
	this.TicketAssignType.FREELANCER_CENTER,


]

exports.timePreference = {
	"IMMEDIATELY": "IMMEDIATELY",
	"WITHIN_24_HOURS": 'WITHIN_24_HOURS',
	"SPECIFIC_DATE_AND_TIME": 'SPECIFIC_DATE_AND_TIME'
}

exports.availableTimePreference = [
	this.timePreference.IMMEDIATELY,
	this.timePreference.WITHIN_24_HOURS,
	this.timePreference.SPECIFIC_DATE_AND_TIME,

]

exports.broadCastCenterInterval = 5

exports.broadCastStatus = {
	"BROADCASTED": 'broadcasted',
	"MATCHED_IN_SAME_CENTER": 'matched_in_same_center',
	"ACCEPTED_AFTER_BROADCAST": 'accepted after broadcast',
	"NO_MATCH_FOUND": 'no_match_found',
	"ACCEPTED_TECHNICIAN_NOT_ASSIGNED": 'accepted technician not assigned'
}

exports.availableBroadCastStatus = [
	this.broadCastStatus.BROADCASTED,
	this.broadCastStatus.MATCHED_IN_SAME_CENTER,
	this.broadCastStatus.ACCEPTED_AFTER_BROADCAST,
	this.broadCastStatus.ACCEPTED_TECHNICIAN_NOT_ASSIGNED,
]

exports.ticketStatus = {
	"PENDING": 'PENDING',
	"PAUSED": 'PAUSED',
	"ACCEPTED": 'ACCEPTED',
	"CLOSED": 'CLOSED',
	"ON_HOLD": 'ON_HOLD'
}

exports.availableTicketStatus = [
	this.ticketStatus.PENDING,
	this.ticketStatus.PAUSED,
	this.ticketStatus.ACCEPTED,
	this.ticketStatus.CLOSED,
]

exports.paymentStatus = {
	"PENDING": "pending",
	"FAILED": "failed",
	"SUCCESS": "success",
}

exports.availablePaymentStatus = [
	this.paymentStatus.PENDING,
	this.paymentStatus.FAILED,
	this.paymentStatus.SUCCESS
]

exports.activeStatus = {
	"DRAFTED": 2,
	"IN_ACTIVE": -1,
	"ACTIVE": 1,
	"DELETED": 0
}

exports.rolesBasedOnNumberOfTechnician = {
	"DEALER": 'DEALER', //no of technician is zero
	"FREELANCER": 'FREELANCER',  //no of technician is one
	"CENTER": 'CENTER',  //no of technician is more than one
}

exports.sequence_generator = {
	CENTER: "center_id",
	TICKET: "ticket_id",
	CLIENT_ID : "client_id",
	CENTER_ONBOARDER_ID: "center_onboarder_id"
}

exports.rolesArray = [
	this.rolesBasedOnNumberOfTechnician.CENTER,
	this.rolesBasedOnNumberOfTechnician.FREELANCER,
	this.rolesBasedOnNumberOfTechnician.DEALER
];

exports.profileCreatedBy = {
	"SELF": 'SELF',
	"SUPER_ADMIN": 'SUPER_ADMIN',
	"CENTER": 'CENTER',
	"SELF_BY_APP": 'SELF_BY_APP'
}

exports.profileCreated = [
	this.profileCreatedBy.SELF,
	this.profileCreatedBy.SUPER_ADMIN,
	this.profileCreatedBy.CENTER,
	this.profileCreatedBy.SELF_BY_APP
]

exports.ticketCreatedBy = {
	"SUPER_ADMIN": 'SUPER_ADMIN',
	"CENTER": 'CENTER',
	"PUBLIC": 'PUBLIC',
	"PUBLIC_WITH_CENTER_QR": "PUBLIC_WITH_CENTER_QR",
	"IMPORT_VIA_EXCEL" : "IMPORT_VIA_EXCEL"
}

exports.ticketCreated = [
	this.ticketCreatedBy.SUPER_ADMIN,
	this.ticketCreatedBy.CENTER,
	this.ticketCreatedBy.PUBLIC,
	this.ticketCreatedBy.PUBLIC_WITH_CENTER_QR,
	this.ticketCreatedBy.IMPORT_VIA_EXCEL

]

exports.engagementType = {
	"SALARIED": 'SALARIED',
	"PART_TIME": 'PART_TIME',
	"FREELANCER": 'FREELANCER',
	"SELF_EMPLOYED": 'SELF_EMPLOYED',
	"CENTER_ADMIN": 'CENTER_ADMIN'
}

exports.engagementTypeArray = [
	this.engagementType.SALARIED,
	this.engagementType.PART_TIME,
	this.engagementType.FREELANCER,
	this.engagementType.SELF_EMPLOYED,
	this.engagementType.CENTER_ADMIN
]