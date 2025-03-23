import { authUser, createUser, getUser } from "../controllers/AuthController";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/ProductController";

const resolvers = {
    Query: {
        //* User Queries
        getUser: async (_, { token } ) => getUser(token),

        //^ Product Queries
        getProducts: async () => getProducts(), 
        getProductById: async (_, { id } ) => getProductById(id),
    },
    Mutation: {
        //* User Mutations
        createUser: async (_, { input }) => createUser(input),
        authenticateUser: async (_, { input }) => authUser(input),

        //^ Product Mutations
        createProduct: async (_, { input } ) => createProduct(input),
        updateProduct: async (_, { id, input }) => updateProduct(id, input),
        deleteProduct: async (_, { id } ) => deleteProduct(id),
    }
};

export default resolvers;