import individualEffectiveness from "./individualEffectiveness";

export default interface pokemonEffectiveness {
  strengths: individualEffectiveness[],
  weaknesses: individualEffectiveness[],
  immune: individualEffectiveness[]
}