import express from "express";
import Emprunt from "../models/schema.js";
import dotenv from "dotenv";
import amqp from "amqplib";

dotenv.config();

const router = express.Router();

let connection, channel;
const queue = 'notification-service-queue';
const queue2 = 'emprunt-service-queue';

const connectToRabbitmq = async () => {
  try {
    connection = await amqp.connect(process.env.amqpURL || "amqp://guest:guest@localhost:5672");
    channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.assertQueue(queue2);
    console.log("AMQP connected");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};

connectToRabbitmq();

router.post("/api/v1/emprunt", async (req, res) => {
  try {
    const emprunt = req.body;
    await Emprunt.create(emprunt);
    res.status(201).send("Created");
  } catch (error) {
    console.error("Error creating emprunt:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/v1/emprunt/:idClient", async (req, res) => {
  try {
    const { idClient } = req.params;
    const livres = await Emprunt.find({ client: idClient });
    if (livres.length > 0) {
      res.status(200).send(livres);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    console.error("Error retrieving emprunt:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/v1/emprunts", async (req, res) => {
  try {
    const emprunts = await Emprunt.find();
    if (emprunts) {
      res.status(200).send(emprunts);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    console.error("Error retrieving emprunt:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/api/v1/emprunt", async (req, res) => {
  try {
    const msg = "The book has id=" + req.body.livre + " is available";
    if (channel) {
      channel.sendToQueue(queue, Buffer.from(msg));
    } else {
      console.error("RabbitMQ channel is not available");
    }

    const empruntLivre = await Emprunt.findOneAndUpdate(
      { livre: req.body.livre, client: req.body.client },
      { dateRetour: Date.now() },
      { new: true }
    );

    if (empruntLivre) {
      await empruntLivre.save();
      res.status(200).send("Updated");
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    console.error("Error updating emprunt:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Graceful shutdown
process.on('exit', async () => {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  console.log("RabbitMQ connection closed");
});

export default router;
