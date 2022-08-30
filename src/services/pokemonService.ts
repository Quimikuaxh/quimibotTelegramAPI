import * as pokemonDB from '../database/pokemon';
import pokemonInfo from "../types/pokemonInfo";
import team from "../types/team";

export function getAllPokemon(){
    return pokemonDB.getAllPokemon();
}
export function getPokemonByID(idNumber: number){
    return pokemonDB.getPokemonByNumber(idNumber);
}
export function getPokemonByName(name: string){
    return pokemonDB.getPokemonByName(name);
}
export function createPokemon(pokemon:pokemonInfo){
    return pokemonDB.createPokemon(pokemon);
}
export function editPokemon(id: number, pokemon: pokemonInfo){
    return pokemonDB.updatePokemon(id, pokemon);
}
export function deletePokemon(id: number){
    return pokemonDB.deletePokemon(id);
}
export function createTeam(team: team){
    return pokemonDB.createPokemonTeam(team);
}