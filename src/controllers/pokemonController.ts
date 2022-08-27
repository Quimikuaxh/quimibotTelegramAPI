import express from 'express';
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";

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
    const { body } = req;
    if(!body){
        res.status(400);
        return;
    }
    res.status(201).send({status: "OK", data: "urlPokePaste"});
}

export function createPokemon(pokemon: pokemonInfo){
    pokemonService.createPokemon(pokemon);
}