import express from "express";
import Client from "../model/schema.js";
const router = express.Router();

router.get("/api/v1/client/:idClient", async (req, res) => {
  const { id } = req.params;
  const livre = await Client.findById(id)
    .then((clients) => {
      if (!clients) {
        res.status(404);
      } else res.send(clients);
    })
});

router.get("/api/v1/clients", async (req, res) => {
  const livre = await Client.find()
    .then((clients) => {
      if (clients.length == 0) {
        res.status(404);
      } else res.send(clients);
    })
    .catch((e) => res.json({ error: e.getMessage() }).status(503));
});

router.post("/api/v1/client", async (req, res) => {
  const infoClient = req.body;
  const newClient = new Client(infoClient);
  await newClient.save().then((client) => {
    res.send(client);
  });
});
router.put("/api/v1/client/:idclient", async (req, res) => {
  const { idclient } = req.params;
  const infoClient = req.body;
  await Client.updateOne({ _id: idclient }, infoClient)
    .then((client) => {
      res.send(client);
    })
    .catch((err) => res.json({ error: err.getMessage() }).status(502));
});
router.delete("/api/v1/client/:idclient", async (req, res) => {
  const { idclient } = req.params;
  await Client.findByIdAndDelete(idclient)
    .then(() => res.send("deleted"))
    .catch((err) => res.json({ error: err.getMessage() }).status(404));
});

export default router;
