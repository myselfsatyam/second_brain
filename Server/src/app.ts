import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/pageRoutes";
import dbConnect from "./config/db";
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
console.log("Loaded HF_API_KEY:", process.env.HF_API_KEY ? "Present" : "Missing");

// Allow both local and Vercel frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://second-brain-three-iota.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cookieParser());
dbConnect();

app.use("/api/v1", router);

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});