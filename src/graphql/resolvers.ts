import { authUser, createUser, getUser } from "../controllers/AuthController";
import { createClient, deleteClient, getClientById, getClients, getSellerClients, updateClient } from "../controllers/ClientController";
import { createOrder } from "../controllers/OrderController";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/ProductController";

const resolvers = {
    // TODO : Add Context to validate if the user is authenticated
    Query: {
        //* User Queries
        getUser: async (_, { token } ) => getUser(token),

        //^ Product Queries
        getProducts: async () => getProducts(), 
        getProductById: async (_, { id } ) => getProductById(id),

        //& Client Queries
        getClients: async (_, { }, ctx) => getClients(),
        getSellerClients: async (_, { }, ctx) => getSellerClients(ctx),
        getClientById: async (_, { id }, ctx ) => getClientById(id, ctx),
    },
    Mutation: {
        //* User Mutations
        createUser: async (_, { input }) => createUser(input),
        authenticateUser: async (_, { input }) => authUser(input),

        //^ Product Mutations
        createProduct: async (_, { input } ) => createProduct(input),
        updateProduct: async (_, { id, input }) => updateProduct(id, input),
        deleteProduct: async (_, { id } ) => deleteProduct(id),

        //& Client Mutations
        createClient: async (_, { input }, ctx ) => createClient(input, ctx), 
        updateClient: async (_, { id, input }, ctx) => updateClient(id, input, ctx),
        deleteClient: async (_, { id }, ctx) => deleteClient(id, ctx),

        //~ Order Mutations
        createOrder: async (_, { input }, ctx) => createOrder(input, ctx),
    }
};

export default resolvers;