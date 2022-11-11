import express from 'express';
import {getPokemonList, getPokemon, createTeam} from '../../controllers/pokemonController';

const v1PokemonRouter = express.Router();

v1PokemonRouter
    .get("/pokemon", getPokemonList)
    .get("/pokemon/:pokemonId", getPokemon)
    .post("/pokemon/team", createTeam)
    .get('/status', (_req, res) => {
        res.sendStatus(200);
    });

export default v1PokemonRouter;