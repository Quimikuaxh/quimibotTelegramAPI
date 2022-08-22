import mongoose from "mongoose";
import {Stats} from "./stats";
import {EditionSchema} from "./edition";

const pokemonSchema = new mongoose.Schema({
    name: String,
    id: String,
    types: [String],
    stats: Stats,
    moves: [EditionSchema],
}, { collection: 'pokemon' });

export {pokemonSchema as PokemonSchema}