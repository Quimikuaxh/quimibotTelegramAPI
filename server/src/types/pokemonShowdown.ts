import pokemonStats from "./pokemonStats";

export default interface pokemonShowdown {
    name: string,
    gender?: string,
    item?: string,
    shiny?:boolean,
    ability?: string,
    level: number,
    nature: string,
    moves?: string[],
    IVs: pokemonStats,
    EVs: pokemonStats,
}