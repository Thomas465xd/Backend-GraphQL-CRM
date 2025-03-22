import { ApolloServer, gql } from "apollo-server-express";
import express from "express";

const app = express();

// Define schema
const typeDefs = gql`

    type Text {
        title: String
        body: String
    }

	type Query {
		getText: Text
	}
`;

const texts = [
    {
        title: "Hello, World! 1",
        body: "This is a simple example of a GraphQL query."
    }, 
    {
        title: "Hello, World! 2 ",
        body: "This is a simple example of a GraphQL query."
    }, 
    {
        title: "Hello, World! 3",
        body: "This is a simple example of a GraphQL query."
    }
]

// Define resolvers
const resolvers = {
	Query: {
		getText: () => {
            return texts[0];
        }
	},
};

// Start Apollo Server before exporting the app
async function startServer() {

    //! IMPORTANT: Apollo Server must be started before applying the middleware
	const server = new ApolloServer({ 
        typeDefs, 
        resolvers 
    });

	await server.start();
	server.applyMiddleware({ app });

	console.log(
		`🚀 GraphQL Server ready at http://localhost:4000${server.graphqlPath}`
	);
}

startServer(); // Start Apollo Server

export default app; // Export the Express app
