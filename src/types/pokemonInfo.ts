import pokemonStats from "./pokemonStats";

export default interface pokemonInfo {
    name: string,
    url: string,
    types: string[],
    stats: pokemonStats
}