import express from 'express'
import amqp from "amqplib"
import mongoose from 'mongoose'
import livreRouter from './routes/livre.js'
import livre from "./models/livre.js"
import dotenv from 'dotenv';
import cors from "cors"
dotenv.config();
const app = express()
app.use(express.json())
app.use(cors({origin : ["http://localhost:3000"]}))
const port = process.env.port || 3004

mongoose.connect(process.env.URL_MONGOOSE || "mongodb://127.0.0.1:27017/dblivre")
.then(() => {
    console.log('Coonected to mongo')
})
.catch((err) => {
    console.log('Unable to connect to mongo')
})


app.use('/', livreRouter)

app.listen(port,()=>console.log("listen"))


