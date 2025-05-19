import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";
import { ApolloError } from "apollo-server-express";
import { generateJWT } from "../utils/jwt";

import bcrypt from 'bcrypt';

// User Input Type
type UserInput = {
    name: string;
    surname: string;
    email: string;
    password: string;
};

type UpdateUserInput = {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    businessName?: string;
    role?: string;
    address?: string;
}

type PasswordInput = {
    currentPassword: string;
    newPassword: string;
}

// Create User Function
export const createUser = async (input: UserInput) => {
    try {
        // Validar input
        const { name, surname, email, password } = input;

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ApolloError("User already exists", "CONFLICT", {
                statusCode: 409,
            });
        }

        // Hashear la contraseña
        const hashedPassword = await hashPassword(password);

        // Crear usuario
        const user = new User({ name, surname, email, password: hashedPassword });
        await user.save();
        
        return user;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error creating user", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
        
    }
};

// Authenticate User Function
export const authUser = async ({ email, password }) => {
    // Verify if the user exists
    const userExists = await User.findOne({ email });
    if(!userExists) {
        throw new ApolloError("User not found", "NOT_FOUND", {
            statusCode: 404,
        });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, userExists.password);
    if (!isPasswordValid) {
        throw new ApolloError("Invalid password", "UNAUTHORIZED", {
            statusCode: 401,
        });
    }

    // Generate Token;
    const token = generateJWT({ id: userExists.id });
    return {
        token,
    };
}

export const forgotPassword = async () => {

}

//! After Account Creation

// Get Authenticated User
export const getUser = async (ctx) => {
    try {
        const userId = ctx.user.id
        const user = await User.findById(userId);
        if (!user) {
            throw new ApolloError("User not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        return user;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        throw new ApolloError("Invalid token", "UNAUTHORIZED", {
            statusCode: 401,
        });
    }
}

// Update User
export const updateUser = async (input: UpdateUserInput, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Get the user id
        const { id } = ctx.user;

        // Check if the user exists
        const userExists = await User.findById(id);
        if (!userExists) {
            throw new ApolloError("User not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        // Update the user 
        const updatedUser = await User.findByIdAndUpdate(id, input, { new: true });
        return updatedUser;

    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        throw new ApolloError("Invalid token", "UNAUTHORIZED", {
            statusCode: 401,
        });
    }
}

// Change Password 
export const changePassword = async (input: PasswordInput, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Get the user id
        const { id } = ctx.user;

        // Check if the user exists
        const userExists = await User.findById(id);
        if (!userExists) {
            throw new ApolloError("User not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        // Get the user reference
        const user = await User.findById(id);
        if (!user) {
            throw new ApolloError("User not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        // Change the password 
        const { currentPassword, newPassword } = input;
        
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ApolloError("Invalid password", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        return "Password Changed Successfully";
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        throw new ApolloError("Invalid token", "UNAUTHORIZED", {
            statusCode: 401,
        });
    }
}