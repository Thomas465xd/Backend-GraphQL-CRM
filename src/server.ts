import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
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
        context: ({ req, res }) => ({ req, res }),  // Pasamos res para modificar la respuesta
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
