import '../env/env';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs'
import {Showdown} from "./utils/showdown";
import {Pokemon} from "./utils/pokemon";
import {resolve} from "path";
import {Utils} from "./utils/utils";

const token = process.env.BOT_TOKEN ?? "tokenVacio"

// eslint-disable-next-line no-console
console.log(token);

const bot = new TelegramBot(token, {
    polling: true,
  });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, 'Hola, soy Quimibot, ¡y hago un montón de cosas! Entre ellas, puedo hacer las siguientes:\n\n' + 
  '*Otros:*\n' +
  '*/covid |* Te digo los diez países con más casos de COVID-19 actualmente', {parse_mode: "Markdown"})
})

bot.onText(/\/covid/, async (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Khe? El covis ya no existe.");
    /*try{
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();

        const message = fs.readFileSync(process.env.TEST_PATH + "/covid"+day+""+month+""+year+".txt",'utf8')
        bot.sendMessage(chatId, message)
  }catch(e){
        // eslint-disable-next-line no-console
        console.error(e)
        bot.sendMessage(chatId, "Se ha producido un error. Por favor, inténtalo de nuevo más tarde.")
    }*/
})

bot.onText(/\/pokemon/, async (msg) => {
    const chatId = msg.chat.id
    const messageText = msg.text;
    try{
        const pokemonName = messageText?.replace("/pokemon", "").trim().toLowerCase();
        if(pokemonName){
            const pokemon = await Pokemon.getSimilarPokemon(pokemonName);
            if(pokemon){
                const capitalizedPokemon = Utils.capitalizeFirstLetter(pokemon);
                const pokemonImage = resolve(__dirname, `../images/fullImage/${pokemon}.png`);
                const image = fs.readFileSync(pokemonImage);
                // eslint-disable-next-line no-console
                console.log(pokemonImage);
                await bot.sendPhoto(chatId, image, {caption : `*${capitalizedPokemon}*\n\n` +
                        //`*Types:* ${pokemon.types}\n\n` +
                        'Esto está aún en construcción. No impacientes, seguro que en no mucho tiempo tienes toda la información que esperabas.', parse_mode: "Markdown"}, {filename: `${pokemon}.png`, contentType: 'application/octet-stream'});
            }
            else{
                await bot.sendMessage(chatId, "No se ha encontrado el pokémon que indicabas.")
            }
        }
        else {
            await bot.sendMessage(chatId, "No se ha encontrado el pokémon que indicabas.")
        }
    }catch(e){
        // eslint-disable-next-line no-console
        console.error(e)
        bot.sendMessage(chatId, "Se ha producido un error. Por favor, inténtalo de nuevo más tarde.");
    }
})

bot.onText(/\/team/, async (msg) => {
    const chatId = msg.chat.id
    const messageText = msg.text;

    const team = messageText?.replace("/team", "").trim() as string;

    try{
        Showdown.parseTeam(team);
        const parsedTeamForPokePaste = Showdown.createPokePasteInput(team);
        const teamURL = await Showdown.createPokePaste(parsedTeamForPokePaste);

        bot.sendMessage(chatId, "Here is your saved team in PokePaste "+String.fromCodePoint(0x1F601)+": "+ teamURL);
    }catch{
        bot.sendMessage(chatId, "Could not parse your team.");
    }
});

