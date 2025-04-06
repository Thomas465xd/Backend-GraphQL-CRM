import mongoose, { Schema, Document } from 'mongoose';

interface OrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface OrderInterface extends Document {
    order: OrderItem[];
    total: number;
    totalWithDiscount?: number;
    client: string;
    seller: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELED';
}

const orderSchema: Schema = new Schema({
    order: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number, 
        required: true
    }, 
    totalWithDiscount: {
        type: Number, 
        default: 0
    },
    client: {
        type: Schema.Types.ObjectId, 
        ref: 'Client',
        required: true
    }, 
    seller: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }, 
    status: {
        type: String, 
        default: 'PENDING', 
        enum: ['PENDING', 'COMPLETED', 'CANCELED']  
    }
}, { timestamps: true });


const Order = mongoose.model<OrderInterface>('Order', orderSchema)

export default Order;