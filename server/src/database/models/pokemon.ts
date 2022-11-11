import mongoose from "mongoose";
import {PokemonSchema} from "../schemas/pokemon";

const PokemonModel = mongoose.model("pokemon", PokemonSchema);

export {PokemonModel}