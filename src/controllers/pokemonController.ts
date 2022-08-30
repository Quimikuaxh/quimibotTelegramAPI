import express from 'express';
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";
import {Pokemon} from "../pokemon";
import team from "../types/team";
import pokemonShowdown from "../types/pokemonShowdown";

export async function getAllPokemon(_req: express.Request, res: express.Response){
    const allPokemon = await pokemonService.getAllPokemon();
    res.send(allPokemon);
}

export async function getPokemon(req: express.Request, res: express.Response){
    let pokemon;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(isNaN(req.params.pokemonId)){
        pokemon = await pokemonService.getPokemonByName(req.params.pokemonId)
    }
    else{
        pokemon = await pokemonService.getPokemonByID(parseInt(req.params.pokemonId))
    }
    pokemon === undefined ? res.sendStatus(404) : res.send(pokemon);

}

export async function createTeam(req: express.Request, res: express.Response){
    const body = req.body;
    if(body !== undefined){
        const pokemonList: pokemonShowdown[] = await Pokemon.parseTeam(body);
        const pokepaste: string = await Pokemon.createPokePaste(body)
        //const user: string = "TEMPORAL";

        const team: team = {
            user: "TEMPORAL",
            team: body,
            parsedTeam: pokemonList,
            pokepaste: pokepaste
        }
        /*pokemonService.createTeam(team).then((dbResponse) => {
            dbResponse === undefined ? res.status(400).send("Team could not be saved in the database.") : res.status(201).send(team)
        });*/
    }
    else{
        res.status(400).send("Team could not be saved in the database. Team format may be wrong, please check it and try again.")
    }
}

export function createPokemon(pokemon: pokemonInfo){
    pokemonService.createPokemon(pokemon);
}