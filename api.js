require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const app = express();
const configs = require("./common/common");

/**
 * imports for routes
 */
const authRoutes = require("./module/Auth/auth_route");
const centerRoutes = require("./module/center/center_route");
const adminRoutes = require("./module/admin/admin_route");
const technicianRoutes = require("./module/technician/technician_route");
const centerOnBoarding = require("./module/centerOnBoardings/route");
const commonRoutes = require("./module/common/common.route");
const migrationRoutes = require("./module/migration/migration.route");
const technicianRoutesApp = require("./module/technican_app/route");
const PORT = process.env.PORT || 8000;
// const uploadFile = require('./middleware/fileupload')

// app.use(uploadFile.any());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, PATCH, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    return res.status(200).json({});
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/center", centerRoutes);
app.use("/admin", adminRoutes);
app.use("/technician", technicianRoutes);
app.use("/common", commonRoutes);
app.use("/migration", migrationRoutes);
app.use("/centerOnboarding", centerOnBoarding);
app.use("/technicianApp", technicianRoutesApp);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hellooo Production DB Updated",
    url: `${req.protocol}://${req.get("host")}`,
  });
});

mongoose
  .connect(configs.mongoUrl.DEVELOPMENT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected!!!");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
