import mongoose, { Schema, Document } from 'mongoose';

export interface UserInterface extends Document {
    name: string;
    surname: string; 
    email: string; 
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
    password: {
        type: String, 
        required: true, 
        trim: true
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }
}, {timestamps: true})

const User = mongoose.model<UserInterface>('User', userSchema)

export default User;