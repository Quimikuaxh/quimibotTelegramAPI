import './env'
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs'

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

