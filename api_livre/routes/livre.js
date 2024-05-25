import express from "express";
import Livre from "../models/livre.js";
import amqp from "amqplib";

const router = express.Router();
const queue = "notification-service-queue";
let channel;

async function connectToRabbitmq() {
  const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
  channel = await connection.createChannel();
  await channel.assertQueue(queue);
}

connectToRabbitmq().then(() => {
  console.log("amqp connected");
});

router.get("/api/v1/livres", async (req, res) => {
  try {
    const livres = await Livre.find();
    if (!livres || livres.length === 0) {
      return res.status(404).json({ message: "Aucun livre trouvé" });
    }
    return res.status(200).json(livres);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des livres",
    });
  }
});

router.get("/api/v1/livre/:idLivre", async (req, res) => {
  try {
    const idLivre = req.params.idLivre;
    const livre = await Livre.findById(idLivre);
    if (!livre) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    return res.status(200).json(livre);
  } catch (error) {
    console.error("Erreur lors de la récupération du livre :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du livre",
    });
  }
});

router.post("/api/v1/livre", async (req, res) => {
  try {
    const { code, title, description, auteur } = req.body;
    const nouveauLivre = new Livre({ code, title, description, auteur });
    await nouveauLivre.save();
    const msg = `Un nouveau livre est disponible : ${title}`;
    await channel.sendToQueue(queue, Buffer.from(msg));
    res.status(200).json({ message: "Livre ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un livre :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du livre" });
  }
});

router.put("/api/v1/livre/:idLivre", async (req, res) => {
  try {
    const idLivre = req.params.idLivre;
    const { title, description, auteur } = req.body;
    const livreToUpdate = await Livre.findById(idLivre);
    if (!livreToUpdate) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    livreToUpdate.title = title || livreToUpdate.title;
    livreToUpdate.description = description || livreToUpdate.description;
    livreToUpdate.auteur = auteur || livreToUpdate.auteur;
    await livreToUpdate.save();
    return res.status(200).json({ message: "Livre mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du livre :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du livre" });
  }
});

router.delete("/api/v1/livre/:idLivre", async (req, res) => {
  try {
    const idLivre = req.params.idLivre;
    const deletedLivre = await Livre.findByIdAndDelete(idLivre);
    if (!deletedLivre) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    return res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du livre :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression du livre" });
  }
});

export default router;
