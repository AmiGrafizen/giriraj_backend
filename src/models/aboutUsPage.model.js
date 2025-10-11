import { Schema, model } from 'mongoose';

const aboutUsPageSchema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    active: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});



export const AboutUsPage = model("AboutUsPage", aboutUsPageSchema);