import mongoose, { Schema, Document } from 'mongoose';

export interface ProductInterface extends Document {
    name: string;
    stock: number; 
    price: number;
    discount: number;
    priceWithDiscount: number;
    description: string;
}

const productSchema : Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    stock: {
        type: Number, 
        required: true, 
    }, 
    price: {
        type: Number, 
        required: true, 
        trim: true
    },
    discount: {
        type: Number, 
        required: false, 
        trim: true, 
        default: 0
    },
    priceWithDiscount: {
        type: Number, 
        required: false, 
        trim: true,
        default: 0
    },
    description: {
        type: String, 
        required: false, 
        trim: true
    }

}, {timestamps: true})

const Product = mongoose.model<ProductInterface>('Product', productSchema)

export default Product;