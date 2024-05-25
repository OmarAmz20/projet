import { Schema,model } from "mongoose";

const schema = new Schema({
    nom : String,
    prenom : String,
    email : String,
});

export default model("client",schema);