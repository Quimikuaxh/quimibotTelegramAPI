import mongoose from "mongoose";
import {TeamSchema} from "../schemas/team";

const TeamModel = mongoose.model("team", TeamSchema);

export {TeamModel}