import User from "../models/User";
import { hashPassword } from "../utils/auth";
import { ApolloError } from "apollo-server-express";

// Create User Function
export const createUser = async ({ email, password }) => {
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
};

// Authenticate User Function
export const authUser = async ({ email, password }) => {
    // Verify if the user exists
}
