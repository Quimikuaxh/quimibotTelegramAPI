import express from 'express';
import {getAllPokemon, getOnePokemon} from '../../controllers/pokemonController';

const v1PokemonRouter = express.Router();

v1PokemonRouter
    .get("/", getAllPokemon)
    .get("/:pokemonId", getOnePokemon)
    .get('/status', (_req, res) => {
        res.sendStatus(200);
    });

export default v1PokemonRouter;