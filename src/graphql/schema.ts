import { gql } from "apollo-server-express";

// Define schema
const typeDefs = gql`
    # //? User Types
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

    # //& Product Types
    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        discount: Float
        description: String
        createdAt: String
    }

    # //? User Inputs
    input UserInput {
        # Create User Input
        name: String!
        surname: String!
        email: String!
        password: String!
    }

    input AuthInput {
        # Login User Input
        email: String!
        password: String!
    }

    # //& Product Inputs
    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
        discount: Float
        description: String
    }

    type Query {
        # //? User Queries
        getUser(token: String!) : User

        # //& Product Queries
        getProducts : [Product]
        getProductById(id: ID!) : Product
    }

    type Mutation {
        # //? User Mutations
        createUser(input: UserInput) : User
        authenticateUser(input: AuthInput) : Token

        #//& Product Mutations
        createProduct(input: ProductInput) : Product
        updateProduct(id: ID!, input: ProductInput) : Product
        deleteProduct(id: ID!) : String
    }
`;

export default typeDefs;