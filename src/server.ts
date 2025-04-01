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
            //console.log("Authorization Header:", authHeader); // 🔍 DEBUG
        
            const token = authHeader.replace("Bearer ", "").trim(); // Remove 'Bearer ' prefix
            //console.log("Token after cleaning:", token); // 🔍 DEBUG
        
            if (token) {
                try {
                    // Get the JWT secret
                    const secret = process.env.JWT_SECRET?.trim();
                    if (!secret) throw new Error("JWT_SECRET is not defined");
        
                    // Verify and decode the token
                    const user = jwt.verify(token, secret);
                    //console.log("Decoded User:", user); // 🔍 DEBUG
        
                    return { user };
                } catch (error) {
                    //console.log("Error verifying token:", error.message);
                    throw new Error("Invalid token");
                }
            }
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
