import pokemonStats from "./pokemonStats";
import pokemonEdition from "./pokemonEdition";

export default interface pokemonInfo {
    name: string,
    id: number,
    types: string[],
    stats: pokemonStats,
    moves: pokemonEdition[],
}