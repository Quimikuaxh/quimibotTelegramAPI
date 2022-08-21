import express from 'express';
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";

export function getAllPokemon(_req: express.Request, res: express.Response){
    const allPokemon = pokemonService.getAllPokemon();
    res.send({status: "OK", data: allPokemon});
}

export function getOnePokemon(req: express.Request, res: express.Response){
    res.send('Get pokemon with id '+req.params.pokemonId);
}

export function createTeam(req: express.Request, res: express.Response){
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