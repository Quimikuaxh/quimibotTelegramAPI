import mongoose from "mongoose";
import pokemonInfo from "../types/pokemonInfo";
import team from "../types/team";
import {PokemonModel} from "./models/pokemon";
import {TeamModel} from "./models/team";

//import DB from './db.json';
import '../../env/env';

const dbURL: string = process.env.MONGO_URL as string;

mongoose.connect(dbURL)
    // eslint-disable-next-line no-console
    .then(() => console.log("Connected to DB."))
    // eslint-disable-next-line no-console
    .catch((e) => console.error("Error trying to connect to DB.\n\n")+e);

export async function getPokemonByName(name: string){
    const pokemonList = await PokemonModel.find({name: name});
    // eslint-disable-next-line no-console
    //console.log(JSON.stringify(pokemon));
    return pokemonList[0];
}

export async function getPokemonByNumber(idNumber: number){
    const pokemonList = await PokemonModel.find({id: idNumber});
    return pokemonList[0];
}

export async function createPokemon(pokemonReceived: pokemonInfo ){
    const pokemon = new PokemonModel(pokemonReceived)

    return pokemon.save((err, document) => {
        if (err)
            // eslint-disable-next-line no-console
            console.error(err);
        else
            // eslint-disable-next-line no-console
            console.log(document.name + ' saved!');
    });
}

export async function updatePokemon(id: number, updatedPokemon: pokemonInfo){
    return PokemonModel.updateOne({_id: id}, {
        $set: updatedPokemon
    });
}

export async function deletePokemon(id: number){
    return PokemonModel.deleteOne({_id: id});
}

export async function getAllPokemon() {
    return PokemonModel.find();
}

export async function createPokemonTeam(teamReceived: team){
    const team = new TeamModel(teamReceived)
    return team.save((err) => {
        if (err)
            // eslint-disable-next-line no-console
            console.error(err);
        else
            // eslint-disable-next-line no-console
            console.log('Team saved!');
    });
}