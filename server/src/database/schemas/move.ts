import mongoose from "mongoose";

const moveSchema = new mongoose.Schema({
    move: String,
    levelLearnt: Number,
    accuracy: Number,
    power: Number,
    description: String,
    effect_chance: Number
})

export {moveSchema as MoveSchema}