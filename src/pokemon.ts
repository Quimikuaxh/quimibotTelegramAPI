import axios from 'axios';
import pokemonInfo from './types/pokemonInfo';
import pokemonStats from './types/pokemonStats';
import {imagePosition} from "./types/imagePosition";
import {generation} from "./types/generation";
import * as cheerio from "cheerio";

const API_URL = "https://pokeapi.co/api/v2/pokemon";
const WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";

export class Pokemon {

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
static async getPokemonInfo(pokemon: string): Promise<pokemonInfo>{
    const result = await axios.get(API_URL + '/'+ pokemon);
    const data = await result.data;

    const types = this.getTypes(data);
    const stats = this.getStats(data);

    // const imageURL = await getImageURL(pokemon, 5, 'black-white', true, true, false, false)
    const imageURL = await this.getImageFromWiki(data.name)

    //const moves = await this.getPokemonMoves(pokemon);

    const res: pokemonInfo = {
        name: data.name.toUpperCase(),
        url: API_URL + '/' + pokemon,
        types: types,
        stats: stats,
        image: imageURL,
        moves: [],
    }
    // eslint-disable-next-line no-console
    console.log(res);
    return res;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
static async getImageURL(name: string, gen: number, game: string, animated: boolean, front: boolean, female: boolean, shiny: boolean): Promise<string>{
    const image_position = this.getImagePosition(front, female, shiny)
    const result = await axios.get(API_URL + '/'+ name);
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
    let searchResult = await axios.get(WIKI_URL + pokemonName);
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

        //First, we obtain the pokémon with the list of moves it can learn
        const data = await pokemon.data;

        const moves = data.moves;

        //console.log(moves[0].move.name);
        //For each move, we get its info and each version in which the pokémon can learn the move
        for(const move of moves) {
            //console.log(move.move.name);
            const moveName = move.move.name;
            const editions = move.version_group_details;
            const moveURL = move.move.url;
            // eslint-disable-next-line no-console
            console.log(moveURL);

            //Now we are getting the move info
            const moveInfo = await fetch(moveURL);
            const moveData = await moveInfo.json();

            const description = moveData.effect_entries.effect;
            //If accuracy or power are null, it takes no effect on the move
            const accuracy = moveData.accuracy == null ? "-" : moveData.accuracy;
            const power = moveData.power == null ? "-" : moveData.power;

            editions.forEach((edition: any) => {
                //console.log(edition.version_group.name);
                const editionName = edition.version_group.name
                const levelLearnt = edition.level_learned_at;

                if (movesByEdition[editionName] == null) {
                    movesByEdition[editionName] = [{
                        "move": moveName,
                        "levelLearnt": levelLearnt,
                        "accuracy": accuracy,
                        "power": power,
                        "description": description
                    }];
                } else {
                    movesByEdition[editionName].push({
                        "move": moveName,
                        "levelLearnt": levelLearnt,
                        "accuracy": accuracy,
                        "power": power,
                        "description": description
                    });
                }
            })
        }
        return movesByEdition;
    }

}
/*getPokemonInfo('mudkip');
getImageFromWiki("mudkip");*/


