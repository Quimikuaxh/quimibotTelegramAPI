import './env'
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs'
import {Pokemon} from './pokemon'

const token = process.env.BOT_TOKEN ?? "tokenVacio"

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

    try{
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
    }
})

bot.onText(/\/pokemon/, async (msg) => {
    const chatId = msg.chat.id
    const messageText = msg.text;
    try{
        const pokemonName = messageText?.replace("/pokemon", "").trim().toLowerCase();
        if(pokemonName){
            const pokemonImage = await Pokemon.getImageFromWiki(pokemonName);
            const pokemon = await Pokemon.getPokemonInfo(pokemonName);
            if(pokemon){
                bot.sendPhoto(chatId, pokemonImage, {caption : `*${pokemon.name}*\n\n` +
                        `*Types:* ${pokemon.types}\n\n` +
                        'Esto está aún en construcción. No impacientes, seguro que en no mucho tiempo tienes toda la información que esperabas.', parse_mode: "Markdown"});
            }
            bot.sendMessage(chatId, "No se ha encontrado el pokémon que indicabas.")
        }
        else {
            bot.sendMessage(chatId, "No se ha encontrado el pokémon que indicabas.")
        }

    }catch(e){
        // eslint-disable-next-line no-console
        console.error(e)
        bot.sendMessage(chatId, "Se ha producido un error. Por favor, inténtalo de nuevo más tarde.")
    }
})

