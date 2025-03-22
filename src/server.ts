import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import colors from "colors";
import resolvers from "./db/resolvers";
import typeDefs from "./db/schema";

const app = express();

// Start Apollo Server before exporting the app
async function startServer() {

    //! IMPORTANT: Apollo Server must be started before applying the middleware
	const server = new ApolloServer({ 
        typeDefs, 
        resolvers 
    });

	await server.start();
	server.applyMiddleware({ app });

	console.log(colors.bold.cyan(
		`🚀 GraphQL Server ready at http://localhost:4000${server.graphqlPath}`
	));
}

startServer(); // Start Apollo Server

export default app; // Export the Express app
