import axios from 'axios';
import pokemonInfo from './types/pokemonInfo';
import pokemonStats from './types/pokemonStats';
import {imagePosition} from "./types/imagePosition";
import {generation} from "./types/generation";
import * as cheerio from "cheerio";
import pokemonID from "./types/pokemonID";
import {pokemonType_ES} from "./types/pokemonType_ES";

export class Pokemon {

    private static API_URL = "https://pokeapi.co/api/v2/";
    private static WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
    private static POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999";

    static async getPokemonList(): Promise<string[]>{
        const pokemonList:string[] = [];

        const result = await axios.get(this.POKEMON_LIST_URL);
        const data = await result.data;

        for(const pokemon of data.results){
            pokemonList.push(pokemon.name);
        }
        return pokemonList
    }

    static async getPokemonInfo(pokemon: string): Promise<pokemonInfo>{
        const result = await axios.get(this.API_URL + 'pokemon/'+ pokemon);
        const data = await result.data;

        const types = this.getTypes(data);
        const stats = this.getStats(data);

        // const imageURL = await getImageURL(pokemon, 5, 'black-white', true, true, false, false)
        const imageURL = await this.getImageFromWiki(data.name)

        const moves = await this.getPokemonMoves(result);

        return {
            name: data.name.toUpperCase(),
            url: this.API_URL + pokemon,
            types: types,
            stats: stats,
            image: imageURL,
            moves: moves,
        };
    }

    static translateType(type:string): string{
        return pokemonType_ES[type.toUpperCase() as keyof typeof pokemonType_ES];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static async getPokemonSpeciesInfo(pokemon: string): Promise<pokemonID[]>{
        const speciesInfo: pokemonID[] = [];

        const result = await axios.get(this.API_URL + 'pokemon-species/'+ pokemon);
        const data = await result.data;

        const id = data.id;

        const varieties = this.getVarieties(data);

        for(const variety of varieties){
            const varietyResult = await axios.get(variety);
            const varietyData = await varietyResult.data;
            const varietyInfo: pokemonID = {
                name: varietyData.name,
                url: variety,
                id: id,
            }
            speciesInfo.push(varietyInfo)
        }
        // eslint-disable-next-line no-console
        console.log(speciesInfo)
        return speciesInfo;
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
                    movesByEdition[edition] = []
                }
                movesByEdition[edition].push(moveByEdition.data);
            }
        }

        for(const edition of editionList){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const editionMoves:any[] = movesByEdition[edition];
            res.push({
                edition: edition,
                moves: editionMoves,
            })
        }
        return res;
    }

    // function used to get the moves asynchronously
    static async getAsyncPokemonMove(name:string, editions: any, url: string): Promise<any[]>{
        const res: any[] = [];
        //Now we are getting the move info
        const moveInfo = await axios.get(url);
        const moveData = await moveInfo.data;

        const description = moveData.effect_entries.effect;
        //If accuracy or power are null, it takes no effect on the move
        const accuracy = moveData.accuracy == null ? "-" : moveData.accuracy;
        const power = moveData.power == null ? "-" : moveData.power;

        editions.forEach((edition: any) => {
            const editionName = edition.version_group.name
            const levelLearnt = edition.level_learned_at;

            res.push({
                edition: editionName,
                data: {
                    "move": name,
                    "levelLearnt": levelLearnt,
                    "accuracy": accuracy,
                    "power": power,
                    "description": description
                }
            });
        });
        return res;
    }

}
