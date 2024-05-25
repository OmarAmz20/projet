import { Schema, model } from "mongoose";


const LivreSchema = Schema({

    code:
        {
            type: String,
            required: true,
            unique: true
        },
    title: String,
    description: String,
    auteur: String


})

export default model('livre', LivreSchema)