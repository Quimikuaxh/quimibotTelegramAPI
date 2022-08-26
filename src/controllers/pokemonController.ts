import express from 'express';
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";

export async function getAllPokemon(_req: express.Request, res: express.Response){
    const allPokemon = pokemonService.getAllPokemon();
    res.send({status: "OK", data: allPokemon});
}

export async function getPokemonByID(req: express.Request, res: express.Response){
    const pokemon = await pokemonService.getPokemonByID(parseInt(req.params.pokemonId))
    res.send(pokemon);
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