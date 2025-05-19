import mongoose, { Schema, Document } from 'mongoose';

export interface UserInterface extends Document {
    name: string;
    surname: string; 
    email: string; 
    phone: string;
    businessName: string;
    role: string;
    address: string; 
    password: string; 
    createdAt: Date;
}

const userSchema : Schema = new Schema({
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
    email: {
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    phone: {
        type: String, 
        required: false, 
        trim: true
    },
    businessName: {
        type: String, 
        required: false, 
        trim: true
    },
    role: {
        type: String, 
        required: false, 
        trim: true
    },
    address: {
        type: String, 
        required: false, 
        trim: true
    },
    password: {
        type: String, 
        required: true, 
        trim: true
    }
}, {timestamps: true})

const User = mongoose.model<UserInterface>('User', userSchema)

export default User;