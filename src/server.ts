import express from 'express';
import v1PokemonRouter from './v1/routes/pokemonRoutes';
const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/v1/pokemon", v1PokemonRouter);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
   console.log('Server running on port '+PORT);
});
