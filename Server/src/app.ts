import  express  from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/pageRoutes";
import dbConnect from "./config/db";
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}))
dotenv.config();
console.log("Loaded HF_API_KEY:", process.env.HF_API_KEY ? "Present" : "Missing");
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true 
}));
app.use(cookieParser());
dbConnect();

//.log("Loaded OpenAI API Key:", process.env.OPENAI_API_KEY); // DEBUG LOG

app.use("/api/v1",router);

app.listen(process.env.PORT,()=>{
  console.log("Server is runing")
})