import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";
import { ApolloError } from "apollo-server-express";
import { generateJWT } from "../utils/jwt";
import Order from "../models/Order";

// User Input Type
type UserInput = {
    name: string;
    surname: string;
    email: string;
    password: string;
};

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

// * Advance Search Functions * //

export const getBestSellers = async () => {
    try {
        const sellers = await Order.aggregate([
            {
                $match: { status: "COMPLETED" }
            }, 
            {
                $group: {
                    _id: "$seller", // Agrupamos por ID de vendedor
                    totalSales: { $sum: "$total" }, // Suma del total vendido (lo creamos)
                    totalOrders: { $sum: 1 } // Contamos la cantidad de pedidos (lo creamos)
                }
            },
            {
                $lookup: {
                    from: "users", // Relacionamos con la colección de usuarios (vendedores)
                    localField: "_id", // El campo para hacer la relación
                    foreignField: "_id", // El campo de referencia en users
                    as: "seller" // El resultado se guardará en seller
                }
            }, 
            {
                $unwind: "$seller" // Desenrollamos el array resultante de seller
            },
            {
                $sort: { totalSales: -1 } // Orden descendente por total vendido
            },
            {
                $limit: 3 // Top 10 vendedores (opcional)
            },
            {
                $project: {
                    seller: 1, // Devuelve la información del vendedor
                    totalOrders: 1, // El total de pedidos
                    totalSales: 1 // El total vendido
                }
            }
        ])

        return sellers;
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching best sellers", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}