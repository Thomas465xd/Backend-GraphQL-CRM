import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import jwt from "jsonwebtoken"; // JWT for authentication
import morgan from "morgan"; // Logging middleware
import dotenv from "dotenv";
import colors from "colors";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/schema";
import { connectDB } from "./config/db";

dotenv.config();

connectDB(); // Connect to MongoDB

// Initialize Express app
const app = express();

// Logs
app.use(morgan("dev"));

// Start Apollo Server before exporting the app
async function startServer() {
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers, 
        context: ({ req }) => { 
            const authHeader = req.headers["authorization"] || "";
            const token = authHeader.replace("Bearer ", "").trim(); 
    
            if (token) {
                try {
                    const secret = process.env.JWT_SECRET?.trim();
                    if (!secret) throw new Error("JWT_SECRET is not defined");
    
                    const user = jwt.verify(token, secret);
                    return { user };
                } catch (error) {
                    // ⚠️ NO lanzar error, solo ignorar el token inválido
                    console.warn("Invalid token ignored in context:", error.message);
                    return {}; // ← Sigue sin usuario, pero no rompe el servidor
                }
            }
    
            return {}; // ← También importante para cuando no hay token
        },
        formatError: (err) => {
            if (err.extensions?.statusCode) {
                return {
                    message: err.message,
                    statusCode: err.extensions.statusCode,
                };
            }

            return err;
        }
    });    

    await server.start();
    server.applyMiddleware({ app });

    console.log(colors.bold.cyan(
        `🎉 GraphQL Server ready at http://localhost:4000${server.graphqlPath}`
    ));
}

startServer(); // Start Apollo Server

export default app; // Export the Express app
