import axios from 'axios';
import pokemonInfo from './types/pokemonInfo';
import pokemonStats from './types/pokemonStats';
import {imagePosition} from "./types/imagePosition";
import {generation} from "./types/generation";
import * as cheerio from "cheerio";
import pokemonID from "./types/pokemonID";
import {pokemonType_ES} from "./types/pokemonType_ES";
import {Utils} from "./utils/utils"

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
    static parseTeam(team: string){
        const pokemonList: string[] = team.trim().split('\n\n');
        const pokemonParsedTeam: any[] = [];
        console.log
        for(const pokemon of pokemonList){
            const pokemonRows = pokemon.split('\n').map(ev => ev.trim());
            const pokemonParsed = {};

            //console.log('---------------------------------------------')
            //console.log(pokemon);
            // first row
            //console.log(pokemonRows);
            if(pokemonRows[0].includes('(')){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonParsed['name'] = pokemonRows[0].split('(')[0].trim();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonParsed['gender'] = pokemonRows[0].split('(')[1].includes('M') ? 'male' : 'female'
            }
            else if(pokemonRows[0].includes('@')){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonParsed['name'] = pokemonRows[0].split('@')[0].trim();
            }
            else{
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonParsed['name'] = pokemonRows[0].trim();
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pokemonParsed['item'] = pokemonRows[0].includes('@') ? pokemonRows[0].split('@')[1].trim() : undefined;

            // the rest of the rows
            if(pokemonRows.length > 1){
                const moves: string[] = [];
                for(let i = 1; i<pokemonRows.length; i++){
                    //console.log(pokemon[i])
                    if(pokemonRows[i].startsWith('Ability:')){
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        pokemonParsed['ability'] = pokemonRows[i].replace('Ability: ', '').trim();
                    }
                    else if(pokemonRows[i].startsWith('Level:')){
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        pokemonParsed['level'] = pokemonRows[i].replace('Ability: ', '').trim();
                    }
                    else if(pokemonRows[i].startsWith('EVs:')){
                        const evs:pokemonStats = {
                            hp: 0,
                            attack: 0,
                            defense: 0,
                            spAtk: 0,
                            spDef: 0,
                            speed: 0
                        };
                        const splitEvs = pokemonRows[i].replace('EVs: ', '').trim().split('/').map(ev => ev.trim());
                        for(const ev of splitEvs){
                            if(ev.includes('HP')){
                                evs.hp = Number(ev.replace('HP', '').trim())
                            }
                            else if(ev.includes('Atk')){
                                evs.attack = Number(ev.replace('Atk', '').trim())
                            }
                            else if(ev.includes('Def')){
                                evs.defense = Number(ev.replace('Def', '').trim())
                            }
                            else if(ev.includes('SpA')){
                                evs.spAtk = Number(ev.replace('SpA', '').trim())
                            }
                            else if(ev.includes('SpD')){
                                evs.spDef = Number(ev.replace('SpD', '').trim())
                            }
                            else if(ev.includes('Spe')){
                                evs.speed = Number(ev.replace('Spe', '').trim())
                            }
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            pokemonParsed['EVs'] = evs;
                        }
                    }
                    else if(pokemonRows[i].includes('Nature')){
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        pokemonParsed['nature'] = pokemonRows[i].replace('Nature: ', '').trim();
                    }
                    else if(pokemonRows[i].startsWith('IVs:')){
                        const ivs:pokemonStats = {
                            hp: 31,
                            attack: 31,
                            defense: 31,
                            spAtk: 31,
                            spDef: 31,
                            speed: 31
                        };
                        const splitIvs = pokemonRows[i].replace('IVs: ', '').trim().split('/').map(ev => ev.trim());
                        for(const iv of splitIvs){
                            if(iv.includes('HP')){
                                ivs.hp = Number(iv.replace('HP', '').trim())
                            }
                            else if(iv.includes('Atk')){
                                ivs.attack = Number(iv.replace('Atk', '').trim())
                            }
                            else if(iv.includes('Def')){
                                ivs.defense = Number(iv.replace('Def', '').trim())
                            }
                            else if(iv.includes('SpA')){
                                ivs.spAtk = Number(iv.replace('SpA', '').trim())
                            }
                            else if(iv.includes('SpD')){
                                ivs.spDef = Number(iv.replace('SpD', '').trim())
                            }
                            else if(iv.includes('Spe')){
                                ivs.speed = Number(iv.replace('Spe', '').trim())
                            }
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        pokemonParsed['IVs'] = ivs;
                    }
                    else if(pokemonRows[i].startsWith('-')){
                        moves.push(pokemonRows[i].replace('- ', '').trim());
                    }
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonParsed['moves'] = moves;
            }
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(pokemonParsed));
            pokemonParsedTeam.push(pokemonParsed);
        }
        return pokemonParsedTeam;
    }
}

Pokemon.parseTeam("Barraskewda (M) @ Aguav Berry  \n" +
    "Ability: Swift Swim  \n" +
    "Level: 96  \n" +
    "Shiny: Yes  \n" +
    "EVs: 40 HP / 48 Atk / 52 Def / 36 SpA / 48 SpD / 72 Spe  \n" +
    "Naughty Nature  \n" +
    "IVs: 29 HP / 29 Atk / 29 Def / 29 SpA / 0 SpD  \n" +
    "- Agility  \n" +
    "- Aqua Jet  \n" +
    "- Brick Break  \n" +
    "- Close Combat  \n" +
    "\n" +
    "Bisharp  \n" +
    "Ability: Defiant  \n" +
    "\n" +
    "Landorus-Therian @ Heavy-Duty Boots  \n" +
    "Ability: Intimidate  \n" +
    "Level: 97  \n" +
    "Shiny: Yes  \n" +
    "EVs: 148 HP / 48 Def  \n" +
    "Relaxed Nature  \n" +
    "- U-turn  \n" +
    "- Calm Mind  \n" +
    "\n" +
    "Urshifu-Rapid-Strike @ Assault Vest  \n" +
    "Ability: Unseen Fist  \n" +
    "EVs: 36 HP / 20 Atk / 32 Def / 40 SpA / 56 SpD / 48 Spe  \n" +
    "Naughty Nature  \n" +
    "IVs: 29 HP / 28 Atk / 28 Def / 28 SpA / 30 SpD / 28 Spe  \n" +
    "- Fire Punch  \n" +
    "- Brick Break  \n" +
    "- Body Slam  \n" +
    "- Body Press  \n" +
    "\n" +
    "Regidrago @ Choice Band  \n" +
    "Ability: Dragon's Maw  \n" +
    "- Crunch  \n" +
    "- Dragon Energy  \n" +
    "\n" +
    "Rockruff  \n" +
    "Ability: Own Tempo  \n" +
    "IVs: 0 Atk  \n" +
    "\n")
