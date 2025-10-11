import { Schema, model } from 'mongoose';

const collectionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
});

const Collection = model('Collection', collectionSchema);

export default Collection;
