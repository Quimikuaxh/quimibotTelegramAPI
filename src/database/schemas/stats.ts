import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
    hp: Number,
    attack: Number,
    defense: Number,
    spAtk: Number,
    spDef: Number,
    speed: Number,
})

export {statsSchema as Stats}