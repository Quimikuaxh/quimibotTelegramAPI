import express from 'express';
import v1PokemonRouter from './v1/routes/pokemonRoutes';
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use('/images', express.static('images'));
app.use(express.json());
app.use(express.text());

app.use("/api/v1", v1PokemonRouter);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
   console.log('Server running on port '+PORT);
});
