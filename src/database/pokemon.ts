import DB from './db.json';
import mongoose from "mongoose";
import pokemonInfo from "../types/pokemonInfo";
import {PokemonModel} from "./models/pokemon";

import '../env';

const dbURL: string = process.env.MONGO_URL as string;

mongoose.connect(dbURL)
    // eslint-disable-next-line no-console
    .then(() => console.log("Connected to DB."))
    // eslint-disable-next-line no-console
    .catch((e) => console.log("Error trying to connect to DB.\n")+e);



export async function getPokemonList(){
    const pokemon = await PokemonModel.find();
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(pokemon));
    return pokemon;
}

export async function createPokemon(pokemonReceived: pokemonInfo ){
    const pokemon = new PokemonModel(pokemonReceived)
    const res = pokemon.save((err, document) => {
        if (err)
            // eslint-disable-next-line no-console
            console.error(err);
        else
            // eslint-disable-next-line no-console
            console.log(document.name+' saved!');
    });
    return res;
}

export async function updatePokemon(id: number, updatedPokemon: pokemonInfo){
    const pokemon = await PokemonModel.updateOne({_id: id}, {
        $set: updatedPokemon
    });
    return pokemon;
}

export async function deletePokemon(id: number){
    const pokemon = await PokemonModel.deleteOne({_id: id});
    return pokemon;
}

export function getAllPokemon(){
    return DB.pokemon;
}