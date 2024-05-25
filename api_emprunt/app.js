import express from "express";
import router from "./routers/router.js"
import mongoose from "mongoose";
import dotenv from "dotenv";
import amqp from  "amqplib"
import cors from "cors"
dotenv.config();
const port = process.env.PORT || 3002;
const url = process.env.URL || "mongodb://127.0.0.1:27017/dbEmprunts" ;

const app = express();

app.use(express.json());
app.use(cors({ origin:[ "http://localhost:3000"], credentials: true }));
app.use(router)
app.listen(port,(err)=>{
    if(err) {
        console.log("error");
    }else console.log("listen at 3002");
})

mongoose.connect(url).then(()=> console.log("db connected"))

