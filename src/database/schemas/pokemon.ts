import mongoose from "mongoose";
import {Stats} from "./stats";

const pokemonSchema = new mongoose.Schema({
    name: String,
    id: String,
    types: [String],
    stats: Stats,
    moves: [Object],
}, { collection: 'pokemon' });

export {pokemonSchema as PokemonSchema}