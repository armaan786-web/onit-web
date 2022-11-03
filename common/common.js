let responseMessages = {
  PARAMETER_MISSING:
    "Insufficient information was supplied. Please check and try again.",
  ACTION_COMPLETE: "Successful",
  BAD_REQUEST: "Invalid Request",
  AUTHENTICATION_FAILED: "Authentication failed",
  ACTION_FAILED: "Something went wrong.Please try again",
  INCORRECT_PASSWORD: "Incorrect Password",
};

exports.s3FileFolderPathIdentifiers = {
  TECHNICIAN_PAN_CARD: "TechniciansData/PanImages",
  TECHNICIAN_PROFILE_PICTURE: "TechniciansData/ProfilePictures",
  AADHAR_FRONT_IMAGE: "TechniciansData/Aadhar/Front",
  AADHAR_BACK_IMAGE: "TechniciansData/Aadhar/Back",
  TECHNICIAN_COMPANY_WORKED_WITH_CERTIFICATE:
    "TechniciansData/CompanyWorkedWithCertificate",
  TICKET_ONSITE_PICTURES: "Ticket/OnsitePictures",
};

exports.awsKeys = {
  BUCKET_NAME: "onits3image",
  SECRET_ACCESS_KEY: "i7BipIH1oK20ZkvWcNGicqZPfq9vOKnARDF3jzwM",
  ACCESS_KEY_ID: "AKIA4TZYC57G4TAEXXXK",
  REGION: "ap-south-1",
};

exports.SMSDetails = {
  URL: `http://world.masssms.tk/V2/http-api.php?apikey=pok9POX1PAImVeyq&templateid=`,
  API_KEY: "pok9POX1PAImVeyq",
  SENDER_ID: "ONITad",
  OTP_TEMPLATE_ID: "1507164369557408315",
  TICKER_CLOSURE: "1507164344080738024",
  TICKER_ASSIGNED: "1507164344045678314",
  CENTER_REGISTRATION: "1508165028827265404",
  TICKET_INFO: "1507164380297949238",
};

exports.mongoUrl = {
  NEW: "mongodb://admin:admin123@localhost:27017/onit?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
  OLD: "mongodb://hello:hello@cluster0-shard-00-00.uatbf.mongodb.net:27017,cluster0-shard-00-01.uatbf.mongodb.net:27017,cluster0-shard-00-02.uatbf.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vn7m4d-shard-0&authSource=admin&retryWrites=true&w=majority",
  DEVELOPMENT:
    "mongodb+srv://rcappdevelopment:Computer%232000@appcluster.ofzabfd.mongodb.net/?retryWrites=true&w=majority",
  PRODUCTION: "mongodb://onituser:Onit0505up@127.0.0.1:27017/Onit_db",
};

exports.twilo = {
  TWILIO_SID: "",
  TWILIO_AUTH: "",
  TWILIO_SERVICE_ID: "",
};

let responseFlags = {
  PARAMETER_MISSING: 100,
  ACTION_COMPLETE: 200,
  BAD_REQUEST: 400,
  AUTHENTICATION_FAILED: 401,
  ACTION_FAILED: 410,
  PERMISSION_NOT_ALLOWED: 403,
};

exports.razorPayKey = {
  key_id: "rzp_live_xv1MWc6HtbSsul",
  key_secret: "6o3opntdKDwQDk3FlQq8YTIg",
};

exports.saltRoundForPasswordHash = 10;

exports.tokenDetails = {
  TOKENSECRET: "LANES@$",
};

exports.getOtpCreation = function () {
  var otp = Math.floor(1000 + Math.random() * 9000);
  const ttl = 5 * 60 * 1000;
  const expires = Date.now() + ttl;
  return {
    otp: otp,
    // otp: 1234,
    expires_in: expires,
  };
};

exports.autoCreateSlug = function (text) {
  text = "" + text; // toString
  text = text.replace(/[^a-zA-Z ]/g, ""); // replace all special char
  text = text.replace(/\s\s+/g, " ");
  s;

  text = text.trim(); //trim text
  text = text.replace(/ /g, "-"); // replace all special char
  text = text.toLowerCase();
  if (!text) {
    text = "slg-" + Math.floor(Math.random() * (999 - 100 + 1) + 100);
  }
  return text;
};

exports.operationType = {
  PUSH: 1,
  PULL: 2,
  REPLACE: 3,
};

exports.actionCompleteResponse = function (res, data, msg) {
  var response = {
    success: 1,
    message: msg || responseMessages.ACTION_COMPLETE,
    status: responseFlags.ACTION_COMPLETE,
    data: data || {},
  };
  res.status(responseFlags.ACTION_COMPLETE).send(JSON.stringify(response));
};

exports.authenticationFailed = function (res, msg, data) {
  var response = {
    success: 0,
    message: msg || "Authentication Failed",
    status: responseFlags.AUTHENTICATION_FAILED,
    data: data || {},
  };
  res.status(responseFlags.AUTHENTICATION_FAILED).send(response);
};

exports.sendActionFailedResponse = function (res, data, msg) {
  var response = {
    success: 0,
    message: msg || responseMessages.ACTION_FAILED,
    status: responseFlags.ACTION_FAILED,
    data: data || {},
  };

  return res.status(responseFlags.ACTION_FAILED).send(response);
};

exports.actionCompleteResponsePagination = function (
  res,
  data,
  msg,
  totalCount
) {
  var response = {
    success: 1,
    message: msg || responseMessages.ACTION_COMPLETE,
    status: responseFlags.ACTION_COMPLETE,
    totalCount: totalCount,
    data: data || {},
  };
  res.status(responseFlags.ACTION_COMPLETE).send(JSON.stringify(response));
};
