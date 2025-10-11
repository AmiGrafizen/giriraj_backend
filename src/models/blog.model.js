import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
    title: {
        type: String,
    },
    content: {
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



export const Blog = model("Blog", blogSchema);