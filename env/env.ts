import { resolve } from 'path'
import { config } from 'dotenv'

//console.log(resolve(__dirname, './.env'))
config({ path: resolve(__dirname, './.env') })
