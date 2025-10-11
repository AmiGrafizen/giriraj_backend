import { Schema, model } from 'mongoose';
import paginate from './plugins/paginate.plugin.js';

const productSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    productImgUrl: { type: String, required: true},
  },
  { timestamps: true }
);

productSchema.plugin(paginate);

const Product = model('Product', productSchema);

export default Product;
