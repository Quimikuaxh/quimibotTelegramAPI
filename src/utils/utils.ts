import * as cheerio from "cheerio";
import axios from 'axios';
import fs from 'fs';
import request from 'request';

//Load in BBDD
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";

export class Utils{
    private static WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
    private static  API_URL = "https://pokeapi.co/api/v2/pokemon";

    static async downloadFullImage(from: number, to: number): Promise<void>{
        for(let i=from ; i<=to; i++){
            const result = await axios.get(this.API_URL + '/'+ i);
            const name = result.data.species.name;
            try{
                let res = '';
                let searchResult = await axios.get(this.WIKI_URL + name);
                let html = searchResult.data;
                let $ = cheerio.load(html)
                const pokemonURL = $('a.unified-search__result__title', html).first().attr('href')

                if(pokemonURL){
                    searchResult = await axios.get(pokemonURL);
                    html = searchResult.data;
                    $ = cheerio.load(html)
                    const aux = $('figure.pi-image > a.image-thumbnail', html).first().attr('href');
                    // eslint-disable-next-line no-console
                    if(aux){
                        res = aux;
                    }
                }
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                this.download(res, "./images/fullImage/"+name+".png", function(){});
            }
            catch(e){
                // eslint-disable-next-line no-console
                console.log(`${name} was not downloaded.`);
            }
        }

    }

    static download(uri: string, filename: fs.PathLike, callback: { (): void; (): void; }){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        request.head(uri, function(_err, _res, _body){
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    }

    static encodeTeam(team: string): string{
        return team.replace(/ /g, "+").replace(/\n/g, "%0D%0A")
            .replace(/\(/g, "%28").replace(/\)/g, "%29")
            .replace(/\//g, "%2F").replace(/:/g, "%3A")
            .replace(/@/g, "%40").replace(/'/g, "%27");
    }

    //Load in BBDD
    static async loadPokemonInDDBB(){
        const fileData = fs.readFileSync("./files/pokemoninfo.json", {encoding: 'utf-8', flag: 'r'});
        const fileJson = JSON.parse(fileData);
        const array = fileJson as pokemonInfo[];
        await this.sleep(10000);
        for(const pokemon of array){
            // eslint-disable-next-line no-console
            console.log("Saving pokémon "+ pokemon.name)
            // eslint-disable-next-line no-console
            pokemonService.createPokemon(pokemon);
        }
    }
    static sleep(ms:number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

