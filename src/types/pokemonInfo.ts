import pokemonStats from "./pokemonStats";

export default interface pokemonInfo {
    name: string,
    id: number,
    types: string[],
    stats: pokemonStats,
    moves: any[],
}