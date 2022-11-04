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
import effectivenesses from "../../files/effectiveness.json";
import individualEffectiveness from "../types/individualEffectiveness";
import pokemonEffectiveness from "../types/pokemonEffectiveness";
import {Utils} from "./utils";
import * as pokemonService from "../services/pokemonService";
import stringSimilarity from "string-similarity";

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

    static getNonExistingPokemonImages(){
        const pokemonList = Object.keys(pokemonMap);
        for(const pokemon of pokemonList){
            if(!fs.existsSync(`images/fullImage/${pokemon}.png`)){
                // eslint-disable-next-line no-console
                console.log(`${pokemon} image is not stored`);
            }
        }
    }

    static translateType(type:string): string{
        return pokemonType_ES[type.toUpperCase() as keyof typeof pokemonType_ES];
    }

    static async getSimilarPokemon(pokemon: string): Promise<string>{
        const pokemonList = await pokemonService.getPokemonList();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pokemonArray: string[] = pokemonList.map((pokemonObject) => {
            return pokemonObject.name;
        }) || [];

        return stringSimilarity.findBestMatch(pokemon, pokemonArray).bestMatch.target;
    }

    static async savePokemonInfoInFile(pokemon: string): Promise<void>{
        try{
            const varietyResult = await axios.get(`${this.API_URL}/pokemon/${pokemon}`);
            const varietyData = await varietyResult.data;

            const jsonContent = JSON.stringify(varietyData);

            fs.writeFile(`./files/info/${pokemon}.json`, jsonContent, 'utf8', function (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    return console.log(err);
                }
            });
        }catch (e) {
            // eslint-disable-next-line no-console
            console.log(pokemon);
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const abilities: string[] = await varietyData.abilities.map((ability) =>  {
            return ability.ability.name;
        })

        const res = {
            name: varietyData.name,
            id: id,
            types: types,
            stats: stats,
            moves: moves,
            abilities: abilities,
        };
        // eslint-disable-next-line no-console
        /*console.log(JSON.stringify(res));*/
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
            let count = 0;
            const maxTries = 5;
            // eslint-disable-next-line no-constant-condition
            while(true){
                try{
                    // eslint-disable-next-line no-console
                    console.log(pokemon);
                    pokemonInfo.push(await this.getPokemonVarietyInfo(pokemon));
                    await Utils.sleep(300);
                    break;
                }catch (e) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line no-console
                    console.log(e.message);
                    await Utils.sleep(3000);
                    if(++count === maxTries){
                        // eslint-disable-next-line no-console
                        console.log(pokemon + " has not been saved.");
                        pokemonLeft.push(pokemon)
                        break;
                    }
                }
            }


        }

        //const pokemonInfo = await Promise.all(pokemonList);
        // eslint-disable-next-line no-console
        console.log("Pokemon left:" + pokemonLeft);

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

    static async getAllPokemonInfo(){
        const list = Object.values(pokemonMap)

        function onlyUnique(value: any, index: any, self: string | any[]) {
            return self.indexOf(value) === index;
        }

        list.filter(onlyUnique);

        for(const pokemon of list){
            await Pokemon.savePokemonInfoInFile(pokemon);
        }
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

        let count = 0;

        //For each move, we get its info and each version in which the pokémon can learn the move
        for(const move of moves) {
            const moveURL = move.move.url;

            const moveName = move.move.name;
            const editions = move.version_group_details;

            if(++count === 40) {
                count = 0;
                await Utils.sleep(500);
            }

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
        let description = moveData.effect_entries[moveData.effect_entries.length-1]?.effect;
        description = description?.replace("$effect_chance%", effectChance);
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

    static getEffectivenesses(pokemon: pokemonInfo): pokemonEffectiveness{
        const pokemonEffectivenesses = {
            "FIRE": 1, "NORMAL": 1, "WATER": 1, "GRASS": 1,
            "ELECTRIC": 1, "ICE": 1, "FIGHTING": 1, "POISON": 1,
            "GROUND": 1, "FLYING": 1, "PSYCHIC": 1, "BUG": 1,
            "ROCK": 1, "GHOST": 1, "DRAGON": 1, "DARK": 1,
            "STEEL": 1, "FAIRY": 1
        };
        const pokemonStrengths: individualEffectiveness[] = [];
        const pokemonWeaknesses: individualEffectiveness[] = [];
        const pokemonImmune: individualEffectiveness[] = [];

        for(const type of pokemon.types){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeStrengths = effectivenesses[type.toUpperCase()].strengths;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeWeaknesses = effectivenesses[type.toUpperCase()].weaknesses;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeImmune = effectivenesses[type.toUpperCase()].immune;

            for(const strength of typeStrengths){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[strength] = pokemonEffectivenesses[strength]/2;
            }
            for(const weakness of typeWeaknesses){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[weakness] = pokemonEffectivenesses[weakness]*2;
            }
            for(const immune of typeImmune){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[immune] = 0;
            }
        }

        for (const effectiveness of Object.keys(pokemonEffectivenesses)){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(pokemonEffectivenesses[effectiveness] > 1){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonWeaknesses.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            else if(pokemonEffectivenesses[effectiveness] < 1 && pokemonEffectivenesses[effectiveness] > 0){
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                pokemonStrengths.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            else if (pokemonEffectivenesses[effectiveness] === 0){
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    pokemonImmune.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
        }
        return {
            strengths: pokemonStrengths,
            weaknesses: pokemonWeaknesses,
            immune: pokemonImmune
        }
    }

    static effectivenessesString(pokemonEffectiveness: pokemonEffectiveness): string{
        let res = "";

        if(pokemonEffectiveness.strengths.length > 0){
            res += "Strong against: \n";
            for(const strength of pokemonEffectiveness.strengths){
                res += `- ${strength.type} x${strength.effectiveness}\n`;
            }
        }
        if(pokemonEffectiveness.weaknesses.length > 0){
            res += "Weak against: \n";
            for(const strength of pokemonEffectiveness.weaknesses){
                res += `- ${strength.type} x${strength.effectiveness}\n`;
            }
        }
        if(pokemonEffectiveness.immune.length > 0){
            res += "Immune against: \n";
            for(const strength of pokemonEffectiveness.immune){
                res += `- ${strength.type}\n`;
            }
        }

        return res.trim();
    }
}