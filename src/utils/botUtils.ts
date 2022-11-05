import emoji from "node-emoji";
import pokemonStats from "../types/pokemonStats";

export class BotUtils{

  static getTypeString(type: string): string{
    switch (type){
      case "fire": return `${emoji.get('fire')} Fuego\n`;
      case "water": return `${emoji.get('droplet')} Agua\n`;
      case "grass": return `${emoji.get('evergreen_tree')} Planta\n`;
      case "electric": return `${emoji.get('lightning')} Eléctrico\n`;
      case "flying": return `${emoji.get('tornado')} Volador\n`;
      case "rock": return `${emoji.get('comet')} Roca\n`;
      case "fairy": return `${emoji.get('fairy')} Hada\n`;
      case "ghost": return `${emoji.get('ghost')} Fantasma\n`;
      case "steel": return `${emoji.get('robot_face')} Acero\n`;
      case "dark": return `${emoji.get('smiling_imp')} Siniestro\n`;
      case "ice": return `${emoji.get('snowflake')} Hielo\n`;
      case "psychic": return `${emoji.get('crystal_ball')} Psíquico\n`;
      case "poison": return `${emoji.get('skull_and_crossbones')} Veneno\n`;
      case "ground": return `${emoji.get('large_brown_square')} Tierra\n`;
      case "bug": return `${emoji.get('spider_web')} Bicho\n`;
      case "fighting": return `${emoji.get('martial_arts_uniform')} Lucha\n`;
      case "dragon": return `${emoji.get('dragon')} Dragón\n`;
      default: return `${emoji.get('white_circle')} Normal\n`;
    }
  }

  static getStatsString(stats: pokemonStats){
    return `${emoji.get('hearts')} HP: ${stats.hp}`
    + `\n${emoji.get('crossed_swords')} Ataque: ${stats.attack}`
    + `\n${emoji.get('shield')} Defensa: ${stats.defense}`
    + `\n${emoji.get('magic_wand')} Ataque especial: ${stats.spAtk}`
    + `\n${emoji.get('mirror')} Defensa especial: ${stats.spDef}`
    + `\n${emoji.get('athletic_shoe')} Velocidad: ${stats.speed}`
  }
}