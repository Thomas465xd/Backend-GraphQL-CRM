import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import resolvers from "./db/resolvers";
import typeDefs from "./db/schema";
import { connectDB } from "./config/db";

dotenv.config();

connectDB(); // Connect to MongoDB

// Initialize Express app
const app = express();

// Start Apollo Server before exporting the app
async function startServer() {

    //! IMPORTANT: Apollo Server must be started before applying the middleware
	const server = new ApolloServer({ 
        typeDefs, 
        resolvers, 
        context: ({ req, res }) => {
            // You can add any context you want to pass to the resolvers here
            return { req, res };
        },
    });

	await server.start();
	server.applyMiddleware({ app });

	console.log(colors.bold.cyan(
		`🎉 GraphQL Server ready at http://localhost:4000${server.graphqlPath}`
	));
}

startServer(); // Start Apollo Server

export default app; // Export the Express app
