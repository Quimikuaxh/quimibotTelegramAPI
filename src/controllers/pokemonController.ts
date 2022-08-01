import express from 'express';
import * as pokemonService from '../services/pokemonService';

export function getAllPokemon(_req: express.Request, res: express.Response){
    const allPokemon = pokemonService.getAllPokemon();
    res.send({status: "OK", data: allPokemon});
}

export function getOnePokemon(req: express.Request, res: express.Response){
    res.send('Get pokemon with id '+req.params.pokemonId);
}