import mongoose, { Schema, Document } from 'mongoose';

export interface ClientInterface extends Document {
    name: string;
    surname: string;
    businessName: string; 
    role: string;
    email: string; 
    phone: string;
    address: string;
    seller: string;
}

const clientSchema : Schema = new Schema({
    name: {
        type: String, 
        required: true, 
        trim: true
    }, 
    surname: {
        type: String, 
        required: true, 
        trim: true
    }, 
    businessName: {
        type: String, 
        required: true, 
        trim: true
    }, 
    role: {
        type: String, 
        required: false, 
        trim: true
    },
    email: {
        type: String, 
        required: true, 
        trim: true
    }, 
    phone: {
        type: String, 
        required: false, 
        trim: true
    },
    address: {
        type: String, 
        required: false, 
        trim: true
    },
    seller: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {timestamps: true})

const Client = mongoose.model<ClientInterface>('Client', clientSchema)

export default Client;