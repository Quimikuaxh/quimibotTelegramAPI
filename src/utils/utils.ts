import * as cheerio from "cheerio";
import axios from 'axios';
import fs from 'fs';
import request from 'request';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xpath from 'xpath-html';

//Load in BBDD
import * as pokemonService from '../services/pokemonService';
import pokemonInfo from "../types/pokemonInfo";
//Load images
//import pokemonMap from "../../files/pokemon.json";

export class Utils{
    private static SEARCH_WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
    private static WIKI_URL = "https://www.wikidex.net/wiki";
    private static WIKI_BASE_URL = "https://www.wikidex.net";
    private static API_URL = "https://pokeapi.co/api/v2/pokemon";

    static async downloadFullImage(from: number, to: number): Promise<void>{
        for(let i=from ; i<=to; i++){
            const result = await axios.get(this.API_URL + '/'+ i);
            const name = result.data.species.name;
            try{
                let res = '';
                let searchResult = await axios.get(this.SEARCH_WIKI_URL + name);
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

    static async downloadNewestImage(list: string[]): Promise<void>{
        for(const name of list){
            try{
                let species = name;
                if(name.includes("mega")){
                    species = name.replace("-mega", "");
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    const html = await result.data;
                    const node = xpath.fromPageSource(html).findElement("//img[contains(@alt, 'Imagen de Mega-') and not(contains(@alt, 'posterior')) and not(contains(@src, 'variocolor'))]");
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".gif", function(){});
                }
                else if(name.includes("gmax")){
                    species = name.replace("-gmax", "");
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    const html = await result.data;
                    const node = xpath.fromPageSource(html).findElement("//img[contains(@alt, 'Gigamax en Pokémon Espada y Pokémon Escudo') and not(contains(@alt, 'posterior')) and not(contains(@src, 'variocolor'))]");
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".gif", function(){});
                }
                else if(name.includes("alola")){
                    species = name.replace("-alola", "");
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    let html = await result.data;
                    let node = xpath.fromPageSource(html).findElement("//a[contains(text(), ' de Alola')]");

                    const regionalResult = await axios.get(this.WIKI_BASE_URL.concat(node.getAttribute("href")));
                    html = regionalResult.data;
                    const nodes = xpath.fromPageSource(html).findElements("//img[contains(@src, 'gif') and ((contains(@alt, 'Espada') and not(contains(@alt, 'Gigamax')) and not(contains(@src, 'variocolor'))) or contains(@alt, 'Pokémon Sol') or contains(@alt, 'Pokémon X')) and not(contains(@alt, 'variocolor')) and not(contains(@src, 'variocolor')) and not(contains(@alt, 'posterior')) and not(contains(@alt, 'hembra'))]");
                    node = nodes[nodes.length-1];
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".gif", function(){});
                }
                else if(name.includes("galar")){
                    species = name.replace("-galar", "");
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    let html = await result.data;
                    let node = xpath.fromPageSource(html).findElement("//a[contains(text(), ' de Galar')]");

                    const regionalResult = await axios.get(this.WIKI_BASE_URL.concat(node.getAttribute("href")));
                    html = regionalResult.data;
                    const nodes = xpath.fromPageSource(html).findElements("//img[contains(@src, 'gif') and ((contains(@alt, 'Espada') and not(contains(@alt, 'Gigamax'))) or contains(@alt, 'Pokémon Sol') or contains(@alt, 'Pokémon X')) and not(contains(@alt, 'variocolor')) and not(contains(@alt, 'Mega'))  and not(contains(@alt, 'Gigamax')) and not(contains(@alt, 'posterior')) and not(contains(@alt, 'hembra')) and not(contains(@src, 'variocolor'))]");
                    node = nodes[nodes.length-1];
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".gif", function(){});
                }
                else if(name.includes("hisui")){
                    species = name.replace("-hisui", "");
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    let html = await result.data;
                    let node = xpath.fromPageSource(html).findElement("//a[contains(text(), ' de Hisui')]");

                    const regionalResult = await axios.get(this.WIKI_BASE_URL.concat(node.getAttribute("href")));
                    html = regionalResult.data;
                    const nodes = xpath.fromPageSource(html).findElements("//img[contains(@src, 'png') and contains(@alt, 'Leyendas Pokémon: Arceus') and not(contains(@src, 'variocolor'))]");
                    node = nodes[nodes.length-1];
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".png", function(){});
                }
                else{
                    const result = await axios.get(this.WIKI_URL + '/'+ species);
                    const html = await result.data;
                    const nodes = xpath.fromPageSource(html).findElements("//img[contains(@src, 'gif') and ((contains(@alt, 'Espada') and not(contains(@alt, 'Gigamax'))) or contains(@alt, 'Pokémon Sol') or contains(@alt, 'séptima generación') or contains(@alt, 'Pokémon Ultrasol') or contains(@alt, 'Pokémon X')) and not(contains(@alt, 'variocolor')) and not(contains(@alt, 'Mega')) and not(contains(@alt, 'posterior'))  and not(contains(@alt, 'Gigamax')) and not(contains(@alt, 'hembra')) and not(contains(@alt, 'posterior')) and not(contains(@src, 'variocolor'))]");
                    const node = nodes[nodes.length-1];
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this.download(node.getAttribute("src"), "./images/newest/"+name+".gif", function(){});
                }
                await this.sleep(2500);
            }
            catch(e){
                // eslint-disable-next-line no-console,@typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-console
                console.log(`${name} was not downloaded. ${e.message}`);
                await this.sleep(2500);
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

//Utils.downloadNewestImage(Object.values(pokemonMap));

//Utils.downloadNewestImage(["pikachu"]);

