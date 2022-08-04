import pokemonStats from "./pokemonStats";

export default interface pokemonInfo {
    name: string,
    id: string,
    types: string[],
    stats: pokemonStats,
    moves: any[],
}