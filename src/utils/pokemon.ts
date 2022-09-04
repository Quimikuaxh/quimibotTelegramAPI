import axios from 'axios';
import pokemonInfo from '../types/pokemonInfo';
import pokemonStats from '../types/pokemonStats';
import {imagePosition} from "../types/imagePosition";
import {generation} from "../types/generation";
import * as cheerio from "cheerio";
import {pokemonType_ES} from "../types/pokemonType_ES";
import pokemonMove from "../types/pokemonMove";
import fs from "fs";
import pokemonMap from "../../files/pokemon.json";

export class Pokemon {

    private static API_URL = "https://pokeapi.co/api/v2/";
    private static WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
    private static POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999";

    static async getPokemonListFromAPI(): Promise<string[]>{
        const pokemonList:string[] = [];

        const result = await axios.get(this.POKEMON_LIST_URL);
        const data = await result.data;

        for(const pokemon of data.results){
            pokemonList.push(pokemon.name);
        }
        return pokemonList
    }

    static translateType(type:string): string{
        return pokemonType_ES[type.toUpperCase() as keyof typeof pokemonType_ES];
    }

    static async getPokemonVarietyInfo(pokemon: string): Promise<pokemonInfo>{
        // eslint-disable-next-line no-console
        //console.log(pokemon);
        const varietyResult = await axios.get(`${this.API_URL}/pokemon/${pokemon}`);
        const varietyData = await varietyResult.data;

        const pokemonSpecies = await axios.get(varietyData.species.url);
        const speciesData = await pokemonSpecies.data;
        const id = speciesData.id;

        const types = this.getTypes(varietyData);
        const stats = this.getStats(varietyData);

        const moves = await this.getPokemonMoves(varietyResult);

        const res = {
            name: varietyData.name,
            id: id,
            types: types,
            stats: stats,
            moves: moves,
        };
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(res));
        return res;
    }



    static async batchAllPokemonInfo():Promise<pokemonInfo[]>{
        const pokemonList = Object.values(pokemonMap);/*.map(pokemon => {
            return this.getPokemonVarietyInfo(pokemon);
        });*/
        const uniq = [...new Set(pokemonList)];
        const pokemonInfo = [];
        const pokemonLeft = [];
        for(const pokemon of uniq){
            try{
                // eslint-disable-next-line no-console
                console.log(pokemon);
                pokemonInfo.push(await this.getPokemonVarietyInfo(pokemon));
            }catch (e) {
                pokemonLeft.push(pokemon)
            }

        }

        //const pokemonInfo = await Promise.all(pokemonList);
        // eslint-disable-next-line no-console
        console.log(pokemonLeft);

        const jsonContent = JSON.stringify(pokemonInfo);

        fs.writeFile("./pokemoninfo-test.json", jsonContent, 'utf8', function (err) {
            if (err) {
                // eslint-disable-next-line no-console
                return console.log(err);
            }

            // eslint-disable-next-line no-console
            console.log("The file was saved!");
        });
        return pokemonInfo;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static async getAllPokemonSpeciesInfo(): Promise<any>{
        const res = {};
        const pokemonLeft: string[] = [];
        for(let i = 1; i<905; i++){ //905
            // eslint-disable-next-line no-console
            console.log("Calculating pokémon number "+i);

            const result = await axios.get(this.API_URL + 'pokemon-species/'+ i.toString());
            const data = await result.data;

            const varieties = this.getVarieties(data);

            if(varieties.length < 6){
                for(const variety of varieties){
                    const varietyResult = await axios.get(variety);
                    const varietyData = await varietyResult.data;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    res[varietyData.name] = varietyData.name;
                }
            }
            else{
                pokemonLeft.push(data.name);
            }
        }

        // eslint-disable-next-line no-console
        console.log("Faltan: \n");
        for(const pokemon of pokemonLeft){
            // eslint-disable-next-line no-console
            console.log(`- ${pokemon} \n`)
        }

        const jsonContent = JSON.stringify(res);

        fs.writeFile("./pokemonList-test.json", jsonContent, 'utf8', function (err) {
            if (err) {
                // eslint-disable-next-line no-console
                return console.log(err);
            }

            // eslint-disable-next-line no-console
            console.log("The file was saved!");
        });
        return res;
    }

    static async getImageURL(name: string, gen: number, game: string, animated: boolean,
                             front: boolean, female: boolean, shiny: boolean): Promise<string>{
        const image_position = this.getImagePosition(front, female, shiny)
        const result = await axios.get(this.API_URL + '/'+ name);
        const data = await result.data;
        return animated ? data['sprites']['versions'][generation[gen]][game]['animated'][imagePosition[image_position]] : data['sprites']['versions'][generation[gen]][game][imagePosition[image_position]];
    }

    static getTypes(data: any): string[] {
        const types = [];
        for(const type of data.types) {
            types.push(type.type.name as string)
        }
        return types;
    }

    static getVarieties(data: any): string[] {
        const varieties = [];
        for(const variety of data.varieties) {
            varieties.push(variety.pokemon.url as string)
        }
        return varieties;
    }

    static getImagePosition(front: boolean, female: boolean, shiny: boolean): imagePosition{
        switch(true){
            case (front && female && shiny): {
                return imagePosition.front_shiny_female;
            }
            case (front && !female && shiny): {
                return imagePosition.front_shiny;
            }
            case (front && !female && !shiny): {
                return imagePosition.front_default;
            }
            case (front && female && !shiny): {
                return imagePosition.front_female;
            }
            case (!front && female && shiny): {
                return imagePosition.back_shiny_female;
            }
            case (!front && !female && shiny): {
                return imagePosition.back_shiny;
            }
            case (!front && !female && !shiny): {
                return imagePosition.back_default;
            }
            case (!front && female && !shiny): {
                return imagePosition.back_female;
            }
            default: return imagePosition.front_default;
        }
    }

    static getStats(data: any): pokemonStats {
        const stats = {} as pokemonStats
        for(const stat of data.stats){
            switch(stat.stat.name){
                case 'hp': {
                    stats.hp = stat.base_stat;
                    break;
                }
                case 'attack': {
                    stats.attack = stat.base_stat;
                    break;
                }
                case 'defense': {
                    stats.defense = stat.base_stat;
                    break;
                }
                case 'special-attack': {
                    stats.spAtk = stat.base_stat;
                    break;
                }
                case 'special-defense': {
                    stats.spDef = stat.base_stat;
                    break;
                }
                case 'speed': {
                    stats.speed = stat.base_stat;
                    break;
                }
                default: {
                    // eslint-disable-next-line no-console
                    console.error('ERROR: A not valid stat has been received.')
                }
            }
        }
        return stats;
    }



    static async getImageFromWiki(pokemonName: string): Promise<string>{
        let res = '';
        let searchResult = await axios.get(this.WIKI_URL + pokemonName);
        let html = searchResult.data;
        let $ = cheerio.load(html)
        const pokemonURL = $('a.unified-search__result__title', html).first().attr('href')

        if(pokemonURL){
            searchResult = await axios.get(pokemonURL);
            html = searchResult.data;
            $ = cheerio.load(html)
            const aux = $('figure.pi-image > a.image-thumbnail', html).first().attr('href');
            if(aux){
                res = aux;
            }
        }
        return res;
    }

    static async getPokemonMoves(pokemon: any): Promise<any[]>{
        const movesByEdition: any[] = [];
        const editionList: string[] = [];
        const res: any[] = [];

        //First, we obtain the pokémon with the list of moves it can learn
        const data = await pokemon.data;

        const moves = data.moves;

        const promises = [];

        //For each move, we get its info and each version in which the pokémon can learn the move
        for(const move of moves) {
            const moveURL = move.move.url;

            const moveName = move.move.name;
            const editions = move.version_group_details;

            promises.push(this.getAsyncPokemonMove(moveName, editions, moveURL));
        }

        const movesAfterPromise = await Promise.all(promises);
        for (const move of movesAfterPromise){
            for(const moveByEdition of move){
                const edition = moveByEdition.edition;
                if(!editionList.includes(edition)){
                    editionList.push(edition);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    movesByEdition[edition] = []
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                movesByEdition[edition].push(moveByEdition.data);
            }
        }

        for(const edition of editionList){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const editionMoves:pokemonMove[] = movesByEdition[edition];
            res.push({
                edition: edition,
                moves: editionMoves,
            })
        }
        return res;
    }

    // function used to get the moves asynchronously
    static async getAsyncPokemonMove(name:string, editions: any, url: string): Promise<pokemonMove[]>{
        const res: pokemonMove[] = [];
        //Now we are getting the move info
        const moveInfo = await axios.get(url);
        const moveData = await moveInfo.data;

        const effectChance = moveData.effect_chance == null ? 0 : moveData.effect_chance;
        let description = moveData.effect_entries[moveData.effect_entries.length-1].effect;
        description = description.replace("$effect_chance%");
        //If accuracy or power are null, it takes no effect on the move
        const accuracy = moveData.accuracy == null ? 101 : moveData.accuracy;
        const power = moveData.power == null ? 0 : moveData.power;

        editions.forEach((edition: any) => {
            const editionName = edition.version_group.name
            const levelLearnt = edition.level_learned_at == null ? 0 : edition.level_learned_at;

            res.push({
                edition: editionName,
                data: {
                    "move": name,
                    "levelLearnt": levelLearnt,
                    "accuracy": accuracy,
                    "power": power,
                    "description": description,
                    "effect_chance": effectChance
                }
            });
        });
        return res;
    }

    static getEVsIVs(evsivs: string[], isEvs: boolean): pokemonStats{
        let res: pokemonStats;
        if(isEvs){
            res = {
                hp: 0,
                attack: 0,
                defense: 0,
                spAtk: 0,
                spDef: 0,
                speed: 0
            };
        }
        else{
            res = {
                hp: 31,
                attack: 31,
                defense: 31,
                spAtk: 31,
                spDef: 31,
                speed: 31
            };
        }
        for(const iv of evsivs){
            if(iv.includes('HP')){
                res.hp = Number(iv.replace('HP', '').trim())
            }
            else if(iv.includes('Atk')){
                res.attack = Number(iv.replace('Atk', '').trim())
            }
            else if(iv.includes('Def')){
                res.defense = Number(iv.replace('Def', '').trim())
            }
            else if(iv.includes('SpA')){
                res.spAtk = Number(iv.replace('SpA', '').trim())
            }
            else if(iv.includes('SpD')){
                res.spDef = Number(iv.replace('SpD', '').trim())
            }
            else if(iv.includes('Spe')){
                res.speed = Number(iv.replace('Spe', '').trim())
            }
        }
        return res;
    }
}