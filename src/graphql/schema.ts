import { gql } from "apollo-server-express";

// Define schema
const typeDefs = gql`
    type User {
        id: ID
        name: String!
        surname: String!
        email: String!
        createdAt: String
    }

    type Token {
        token: String
    }

    input UserInput {
        name: String!
        surname: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    type Query {
        hello: String
    }

    type Mutation {
        createUser(input: UserInput) : User
        authenticateUser(input: AuthInput) : Token
    }
`;

export default typeDefs;