import { Schema, model } from "mongoose";

const schema = new Schema({
  livre: String,
  client: String,
  dateEmprunt: { type: Date, default: Date.now },
  dateRetour: { type: Date, default: null },
});

export default model("emprunt",schema)