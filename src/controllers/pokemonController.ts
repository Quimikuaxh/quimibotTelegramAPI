import express from 'express';
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";
import team from "../types/team";
import pokemonShowdown from "../types/pokemonShowdown";
import {Showdown} from "../utils/showdown";
import stringSimilarity from 'string-similarity';

export async function getAllPokemon(_req: express.Request, res: express.Response){
    const allPokemon = await pokemonService.getAllPokemon();
    res.send(allPokemon);
}

export async function getPokemonList(_req: express.Request, res: express.Response){
    const pokemonList = await pokemonService.getPokemonList();
    res.send(pokemonList);
}

export async function getPokemon(req: express.Request, res: express.Response){
    let pokemon;
    const pokemonList = await pokemonService.getPokemonList();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pokemonArray: string[] = pokemonList.map((pokemonObject) => {
        return pokemonObject.name;
    }) || [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(isNaN(req.params.pokemonId)){
        const finalPokemon = stringSimilarity.findBestMatch(req.params.pokemonId, pokemonArray).bestMatch.target;
        if(finalPokemon){
            pokemon = await pokemonService.getPokemonByName(finalPokemon)
        }
        else{
            pokemon = await pokemonService.getPokemonByName(req.params.pokemonId)
        }
    }
    else{
        pokemon = await pokemonService.getPokemonByID(parseInt(req.params.pokemonId))
    }
    pokemon === undefined ? res.sendStatus(404) : res.send(pokemon);

}

export async function createTeam(req: express.Request, res: express.Response){
    const body = req.body;
    if(body !== undefined){
        try{
            const parsedBody = body.replace(/\r\n/g, '\n');
            const pokemonList: pokemonShowdown[] = await Showdown.parseTeam(parsedBody);
            const pokepaste: string = await Showdown.createPokePaste(parsedBody)
            //const user: string = "TEMPORAL";

            const team: team = {
                user: "TEMPORAL",
                team: body,
                parsedTeam: pokemonList,
                pokepaste: pokepaste
            }

            // eslint-disable-next-line no-console
            console.log(team);
            pokemonService.createTeam(team).then(() => {
                res.status(201).send(team)
            });
        }catch(e){
            res.status(400).send("Team could not be saved in the database. Team format may be wrong, please check it and try again.")
        }
    }
    else{
        res.status(400).send("Team could not be saved in the database. Team format may be wrong, please check it and try again.")
    }
}

export function createPokemon(pokemon: pokemonInfo){
    pokemonService.createPokemon(pokemon);
}