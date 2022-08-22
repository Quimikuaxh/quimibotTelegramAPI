export default interface pokemonMoveInfo {
    move: string,
    levelLearnt: number,
    accuracy?: number,
    power?: number,
    description: string,
    effect_chance: number
}