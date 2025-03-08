import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";

import authRoute from "./routes/auth.route.js";
import testimonialRoute from "./routes/testimonial.route.js";
import blogRoute from "./routes/blog.route.js";
import vacancyRoute from "./routes/vacancy.route.js";
import doctorRoute from "./routes/doctor.route.js";
import jobApplicationRoute from "./routes/jobApplication.route.js";
import contactMessageRoute from "./routes/contactMessage.route.js";
import mailingListRoute from "./routes/mailingList.route.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/testimonial", testimonialRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/vacancy", vacancyRoute);
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/jobApplication", jobApplicationRoute);
app.use("/api/v1/contactMessage", contactMessageRoute);
app.use("/api/v1/mailingList", mailingListRoute);

app.use(errorHandler);

export { app };
