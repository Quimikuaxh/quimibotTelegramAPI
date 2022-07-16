import * as cheerio from "cheerio";
import axios from 'axios';
import fs from 'fs';
import request from 'request';

const WIKI_URL = "https://pokemon.fandom.com/es/wiki/Especial:Buscar?query=";
const API_URL = "https://pokeapi.co/api/v2/pokemon";

async function downloadFullImage(from: number, to: number): Promise<void>{
    for(let i=from ; i<=to; i++){
        const result = await axios.get(API_URL + '/'+ i);
        const name = result.data.species.name;
        try{
            let res = '';
            let searchResult = await axios.get(WIKI_URL + name);
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
            download(res, "./images/fullImage/"+name+".png", function(){});
        }
        catch(e){
            // eslint-disable-next-line no-console
            console.log(`${name} was not downloaded.`);
        }
    }

}

function download(uri: string, filename: fs.PathLike, callback: { (): void; (): void; }){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request.head(uri, function(_err, _res, _body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

downloadFullImage(1, 915)