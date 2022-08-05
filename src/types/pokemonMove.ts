export default interface pokemonMove {
    edition: string,
    data:{
        move: string,
        levelLearnt: number,
        accuracy?: number,
        power?: number,
        description: string,
        effect_chance: number
    }
}