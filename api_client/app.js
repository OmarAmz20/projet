import express from "express";
import cors from "cors";
import amqp from "amqplib";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Route from "./routes/router.js";
import Client from "./model/schema.js";

dotenv.config();

const url = process.env.URL || "mongodb://127.0.0.1:27017/dbclients";
const port = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(cors());
app.use(Route);
app.use(cors({ origin:[ "http://localhost:3000"], credentials: true }));
// Connect to MongoDB
mongoose.connect(url)
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB connection error:", err));

// Start the server
app.listen(port, (err) => {
  if (err) {
    console.error("Server error:", err);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});

// RabbitMQ connection
let connection, channel;
const queue = 'Client_queue';

async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    channel = await connection.createChannel();
    await channel.assertQueue(queue);

    // Fetch client emails from MongoDB
    const clients = await Client.find({}, { email: 1 });
    const emailList = clients.map(client => client.email);
    console.log(emailList);
    // Send emails to RabbitMQ queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailList)));
    console.log("Emails sent to RabbitMQ queue");

    // Handle graceful shutdown
    process.on('exit', () => {
      channel.close();
      console.log("RabbitMQ channel closed");
    });
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
  }
}

connectToRabbitMQ().then(() => console.log("RabbitMQ connected"));
