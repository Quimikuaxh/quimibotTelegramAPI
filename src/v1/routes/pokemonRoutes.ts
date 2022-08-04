import express from 'express';
import {getAllPokemon, getOnePokemon, createTeam} from '../../controllers/pokemonController';

const v1PokemonRouter = express.Router();

v1PokemonRouter
    .get("/", getAllPokemon)
    .get("/:pokemonId", getOnePokemon)
    .post("/", createTeam)
    .get('/status', (_req, res) => {
        res.sendStatus(200);
    });

export default v1PokemonRouter;