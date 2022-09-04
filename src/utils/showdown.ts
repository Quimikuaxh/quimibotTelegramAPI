import {Utils} from "./utils";
import axios from "axios";
import pokemonMap from "../../files/pokemon.json";
import pokemonShowdown from "../types/pokemonShowdown";
import pokemonStats from "../types/pokemonStats";
import {getPokemonByName} from "../services/pokemonService";
import {Pokemon} from "./pokemon";

export class Showdown{

    private static POKEPASTE_URL = "https://pokepast.es/create";

    static createPokePasteInput(team:string): string{
        const encodedTeam = Utils.encodeTeam(team);
        return `paste=${encodedTeam}&title=Prueba&author=Quimibot&notes=Notas`
    }

    static async createPokePaste(input: string): Promise<string>{
        const encodedTeam = this.createPokePasteInput(input);
        const searchResult = await axios({
            method: 'post',
            url: this.POKEPASTE_URL,
            data: encodedTeam
        });

        return `${searchResult.request.protocol}//${searchResult.request.host}${searchResult.request.path}` as string;
    }

    static async translatePokemonFromShowdown(pokemonFromShowdown: string){
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return pokemonMap[pokemonFromShowdown];
    }

    static async parseTeam(team: string): Promise<pokemonShowdown[]>{
        try{
            const pokemonList: string[] = team.trim().split('\n\n');
            const pokemonParsedTeam: pokemonShowdown[] = [];

            for(const pokemon of pokemonList){
                const pokemonRows = pokemon.split('\n').map(ev => ev.trim());
                const pokemonParsed:pokemonShowdown = {
                    name: "Missigno",
                    shiny: false,
                    level: "100",
                };

                let evs:pokemonStats = {
                    hp: 0,
                    attack: 0,
                    defense: 0,
                    spAtk: 0,
                    spDef: 0,
                    speed: 0
                };
                let ivs:pokemonStats = {
                    hp: 31,
                    attack: 31,
                    defense: 31,
                    spAtk: 31,
                    spDef: 31,
                    speed: 31
                };

                // First row
                if(pokemonRows[0].includes('(')){
                    pokemonParsed.name = pokemonRows[0].split('(')[0].trim();
                    pokemonParsed.gender = pokemonRows[0].split('(')[1].includes('M') ? 'male' : 'female'
                }
                else if(pokemonRows[0].includes('@')){
                    pokemonParsed.name = pokemonRows[0].split('@')[0].trim();
                }
                else{
                    pokemonParsed.name = pokemonRows[0].trim();
                }
                const pokemonName = await this.translatePokemonFromShowdown(pokemonParsed.name.toLowerCase());
                let pokemonInDB;
                if(pokemonName === undefined){
                    throw new Error(`Pokémon name ${pokemonParsed.name} is not correct`);
                }
                else{
                    pokemonInDB = await getPokemonByName(pokemonName);
                    if(pokemonInDB === undefined){
                        throw new Error(`Pokémon ${pokemonName} was not found in DB`);
                    }
                }
                pokemonParsed.item = pokemonRows[0].includes('@') ? pokemonRows[0].split('@')[1].trim() : undefined;

                // The rest of the rows
                if(pokemonRows.length > 1){
                    const moves: string[] = [];
                    for(let i = 1; i<pokemonRows.length; i++){
                        if(pokemonRows[i].startsWith('Ability:')){
                            pokemonParsed.ability = pokemonRows[i].replace('Ability: ', '').trim();
                        }
                        else if(pokemonRows[i].startsWith('Level:')){
                            pokemonParsed.level = pokemonRows[i].replace('Level: ', '').trim();
                        }
                        else if(pokemonRows[i].startsWith('EVs:')){
                            const splitEvs = pokemonRows[i].replace('EVs: ', '').trim().split('/').map(ev => ev.trim());
                            evs = Pokemon.getEVsIVs(splitEvs, true);
                        }
                        else if(pokemonRows[i].includes('Nature')){
                            pokemonParsed.nature = pokemonRows[i].replace('Nature: ', '').trim();
                        }
                        else if(pokemonRows[i].startsWith('IVs:')){
                            const splitIvs = pokemonRows[i].replace('IVs: ', '').trim().split('/').map(ev => ev.trim());
                            ivs = Pokemon.getEVsIVs(splitIvs, true);
                        }
                        else if(pokemonRows[i].startsWith('-')){
                            moves.push(pokemonRows[i].replace('- ', '').trim());
                        }
                    }
                    pokemonParsed.moves = await this.translateMoves(pokemonParsed.name, moves);
                    pokemonParsed.IVs = ivs;
                    pokemonParsed.EVs = evs;
                }
                pokemonParsedTeam.push(pokemonParsed);
            }
            // eslint-disable-next-line no-console
            //console.log(pokemonParsedTeam)
            return pokemonParsedTeam;
        }catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            throw e;
        }
    }

    static async translateMoves(pokemon: string, moves: string[]){
        const savedPokemon = await getPokemonByName(pokemon.toLowerCase());
        const translatedMoves = [];
        const translatedNames: string[] = [];
        const savedMoves = savedPokemon.moves[savedPokemon.moves.length - 1];
        for(const move of moves){
            let moveFound = false;
            const lcMove = move.toLowerCase();
            const splitMove = lcMove.split(' ');
            for(const savedMove of savedMoves.moves){
                if(!translatedNames.includes(savedMove)){
                    let moveIsCorrect = true;
                    for(const piece of splitMove){
                        if(!savedMove.move.toLowerCase().includes(piece)){
                            moveIsCorrect = false;
                            break;
                        }
                    }
                    if(moveIsCorrect){
                        translatedMoves.push(savedMove);
                        translatedNames.push(savedMove.move);
                        moveFound = true;
                        break;
                    }
                }
            }
            if(!moveFound){
                throw new Error(`Move ${move} was not found`);
            }
        }
        return translatedMoves;
    }
}