import mongoose from "mongoose";
import {Stats} from "./stats";

const pokemonSchema = new mongoose.Schema({
    name: String,
    id: String,
    types: [String],
    stats: Stats,
    moves: [Object],
}, { collection: 'pokemon',
    toJSON: {
        transform: function(_doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

export {pokemonSchema as PokemonSchema}