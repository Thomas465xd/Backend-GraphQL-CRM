import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";
import { ApolloError } from "apollo-server-express";
import { generateJWT } from "../utils/jwt";

// Create User Function
export const createUser = async ({ email, password }) => {
    try {
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
        const user = new User({ email, password: hashedPassword });
        await user.save();
        
        return user;
    } catch (error) {
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

// Get Authenticated User
export const getUser = async (token) => {
    try {
        // Verify if the token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        const userId = decoded.id;

        // Find user by id
        const user = await User.findById(userId);
        if (!user) {
            throw new ApolloError("User not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        return user;
    } catch (error) {
        throw new ApolloError("Invalid token", "UNAUTHORIZED", {
            statusCode: 401,
        });
    }
}