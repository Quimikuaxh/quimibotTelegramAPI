import axios from 'axios';
import pokemonInfo from './types/pokemonInfo';
import pokemonStats from './types/pokemonStats';
import {imagePosition} from "./types/imagePosition";
import {generation} from "./types/generation";
import * as cheerio from "cheerio";
import pokemonID from "./types/pokemonID";
import {pokemonType_ES} from "./types/pokemonType_ES";
import {Utils} from "./utils/utils"
import pokemonShowdown from "./types/pokemonShowdown";
import pokemonMove from "./types/pokemonMove";
import fs from "fs";

export class Pokemon {

    private static API_URL = "https://pokeapi.co/api/v2/";
    private static WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
    private static POKEMON_LIST_URL = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=9999";
    private static POKEPASTE_URL = "https://pokepast.es/create";

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

        const res = {
            name: data.name.toUpperCase(),
            url: this.API_URL + pokemon,
            types: types,
            stats: stats,
            image: imageURL,
            moves: moves,
        };
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(res));
        return res;
    }

    static translateType(type:string): string{
        return pokemonType_ES[type.toUpperCase() as keyof typeof pokemonType_ES];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static async getPokemonSpeciesInfo(): Promise<any>{
        const res = {};
        const pokemonLeft: string[] = [];
        for(let i = 1; i<905; i++){ //905
            // eslint-disable-next-line no-console
            console.log("Calculating pokémon number "+i);
            const speciesInfo: pokemonID[] = [];

            const result = await axios.get(this.API_URL + 'pokemon-species/'+ i.toString());
            const data = await result.data;

            const id = data.id;

            const varieties = this.getVarieties(data);

            if(varieties.length < 6){
                for(const variety of varieties){
                    const varietyResult = await axios.get(variety);
                    const varietyData = await varietyResult.data;
                    const varietyInfo: pokemonID = {
                        name: varietyData.name,
                        url: variety,
                        id: id,
                    }
                    speciesInfo.push(varietyInfo)
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

        fs.writeFile("./pokemon.json", jsonContent, 'utf8', function (err) {
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

    static createPokePasteInput(team:string): string{
        const encodedTeam = Utils.encodeTeam(team);
        return `paste=${encodedTeam}&title=Prueba&author=Quimibot&notes=Notas`
    }

    static async createPokePaste(input: string): Promise<string>{
        const searchResult = await axios({
            method: 'post',
            url: this.POKEPASTE_URL,
            data: input
        });

        return `${searchResult.request.protocol}//${searchResult.request.host}${searchResult.request.path}` as string;
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

        const description = moveData.effect_entries.effect;
        //If accuracy or power are null, it takes no effect on the move
        const accuracy = moveData.accuracy == null ? undefined : moveData.accuracy;
        const power = moveData.power == null ? undefined : moveData.power;

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
    static parseTeam(team: string): pokemonShowdown[]{
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
                            evs = this.getEVsIVs(splitEvs, true);
                        }
                        else if(pokemonRows[i].includes('Nature')){
                            pokemonParsed.nature = pokemonRows[i].replace('Nature: ', '').trim();
                        }
                        else if(pokemonRows[i].startsWith('IVs:')){
                            const splitIvs = pokemonRows[i].replace('IVs: ', '').trim().split('/').map(ev => ev.trim());
                            ivs = this.getEVsIVs(splitIvs, true);
                        }
                        else if(pokemonRows[i].startsWith('-')){
                            moves.push(pokemonRows[i].replace('- ', '').trim());
                        }
                    }
                    pokemonParsed.moves = moves;
                    pokemonParsed.IVs = ivs;
                    pokemonParsed.EVs = evs;
                }
                pokemonParsedTeam.push(pokemonParsed);
            }
            // eslint-disable-next-line no-console
            console.log(pokemonParsedTeam)
            return pokemonParsedTeam;
        }catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            throw e;
        }

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