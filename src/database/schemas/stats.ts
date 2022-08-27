import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
    hp: Number,
    attack: Number,
    defense: Number,
    spAtk: Number,
    spDef: Number,
    speed: Number,
}, {
    toJSON: {
        transform: function(_doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
})

export {statsSchema as Stats}