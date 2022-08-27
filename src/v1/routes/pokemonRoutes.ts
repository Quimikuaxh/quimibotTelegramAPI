import express from 'express';
import {getAllPokemon, getPokemon, createTeam} from '../../controllers/pokemonController';

const v1PokemonRouter = express.Router();

v1PokemonRouter
    .get("/pokemon", getAllPokemon)
    .get("/pokemon/:pokemonId", getPokemon)
    .post("/pokemon/team", createTeam)
    .get('/status', (_req, res) => {
        res.sendStatus(200);
    });

export default v1PokemonRouter;