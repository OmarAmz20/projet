import express from "express";
import amqp from "amqplib";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();

let connection, channel;
const q = "notification-service-queue";
const qClients = "Client_queue";
var mails;
const connectRabbitMQ = async () => {
  try {
    const ch = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(ch);
    channel = await connection.createChannel();
    await channel.assertQueue(q);
    await channel.assertQueue(qClients);
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kilobtata2004@gmail.com",
    pass: "ktrquuwmbsxgipim",
  },
});

connectRabbitMQ().then(async() => {
  console.log("RabbitMQ connection established");
   
  channel.consume(qClients, (data) => {
    mails = JSON.parse(data.content.toString());
    console.log("Received clients data:", mails);
  });

    channel.consume(q, (data) => {
    const messageContent = data.content.toString();
    console.log("Received message content:", messageContent);

    if (mails.length > 0) {
        mails.forEach((e) => {
          if (e) {
            const mailOptions = {
              from: "kilobtata2004@gmail.com",
              to:e,
              subject: "Sending Email using Node.js",
              text: messageContent,
            };
  
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log("Error sending email:", error);
              } else {
                console.log("Email sent:", info.response);
              }
            });
          } else {
            console.log("Invalid email address:", e);
          }
        });
      } else {
        console.log("No client emails available to send.");
      }
    channel.ack(data);
  });
});

app.listen(3003, () => {
  console.log("Server listening at port 3003");
});
