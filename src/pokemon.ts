import axios from 'axios';
import pokemonInfo from './types/pokemonInfo';
import pokemonStats from './types/pokemonStats';
import {imagePosition} from "./types/imagePosition";

const URL = "https://pokeapi.co/api/v2/pokemon";

async function getPokemonInfo(pokemon: string): Promise<pokemonInfo>{
    const result = await axios.get(URL + '/'+ pokemon);
    const data = await result.data;

    const types = getTypes(data);
    const stats = getStats(data);

    const res: pokemonInfo = {
        name: data.name,
        url: URL + '/' + pokemon,
        types: types,
        stats: stats,
    }
    // eslint-disable-next-line no-console
    console.log(res);
    return res;
}

async function getImageURL(name: string, gen: string, game: string, animated: boolean, image_position: imagePosition): Promise<string>{
    const result = await axios.get(URL + '/'+ name);
    const data = await result.data;
    const url = animated ? data['sprites']['versions'][gen][game]['animated'][imagePosition[image_position]] : data['sprites']['versions'][gen][game][imagePosition[image_position]];
    // eslint-disable-next-line no-console
    console.log(url);
    return url;
}

function getTypes(data: any): any[] {
    const types = [];
    for(const type of data.types) {
        types.push(type.type.name)
    }
    return types;
}

function getStats(data: any): pokemonStats {
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

/*async function getPokemonMoves(){
    let movesByEdition = [];

    //First, we obtain the pokémon with the list of moves it can learn
    const result = await axios.get(URL + '/'+ "pikachu");
    const data = await result.data;

    let moves = data.moves;
    let stats = data.stats;

    //console.log(moves[0].move.name);
    //For each move, we get its info and each version in which the pokémon can learn the move
    for(const move of moves) {
        //console.log(move.move.name);
        let moveName = move.move.name;
        let editions = move.version_group_details;
        let moveURL = move.move.url;
        console.log(moveURL);

        //Now we are getting the move info
        let moveInfo = await fetch(moveURL);
        let moveData = await moveInfo.json();

        let description = moveData.effect_entries.effect;
        //If accuracy or power are null, it takes no effect on the move
        let accuracy = moveData.accuracy == null ? "-" : moveData.accuracy;
        let power = moveData.power == null ? "-" : moveData.power;

        editions.forEach((edition) => {
            //console.log(edition.version_group.name);
            const editionName = edition.version_group.name
            const levelLearnt = edition.level_learned_at;

            if (movesByEdition[editionName] == null) {
                movesByEdition[editionName] = [{
                    "move": moveName,
                    "levelLearnt": levelLearnt,
                    "accuracy": accuracy,
                    "power": power
                }];
            } else {
                movesByEdition[editionName].push({
                    "move": moveName,
                    "levelLearnt": levelLearnt,
                    "accuracy": accuracy,
                    "power": power
                });
            }
        })
    }
}*/

getPokemonInfo('mudkip');
getImageURL("mudkip", 'generation-v', 'black-white', true, imagePosition.front_default)


