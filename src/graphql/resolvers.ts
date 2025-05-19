import { getBestClients, getBestSellers, getGeneralActivity, getProductsByName, getRecentActivity } from "../controllers/AnalyticsController";
import { authUser, changePassword, createUser, getUser, updateUser } from "../controllers/AuthController";
import { createClient, deleteClient, getClientById, getClients, getSellerClients, updateClient } from "../controllers/ClientController";
import { createOrder, deleteOrder, getOrderById, getOrders, getOrdersByClient, getOrdersBySeller, getOrdersByStatus, updateOrder } from "../controllers/OrderController";
import { createProduct, deleteProduct, getProductById, getProducts, getProductsBySeller, updateProduct } from "../controllers/ProductController";

const resolvers = {
    // TODO : Add Context to validate if the user is authenticated
    Query: {
        //* User Queries
        getUser: async (_, { }, ctx ) => getUser(ctx),

        //^ Product Queries
        getProducts: async (_, { }, ctx) => getProducts(ctx), 
        getProductsBySeller: async (_, { }, ctx) => getProductsBySeller(ctx),
        getProductById: async (_, { id }, ctx ) => getProductById(id, ctx),

        //& Client Queries
        getClients: async (_, { }, ctx) => getClients(ctx),
        getSellerClients: async (_, { }, ctx) => getSellerClients(ctx),
        getClientById: async (_, { id }, ctx ) => getClientById(id, ctx),

        //~ Order Queries
        getOrders: async (_, { }, ctx) => getOrders(ctx),
        getOrdersBySeller: async (_, { }, ctx) => getOrdersBySeller(ctx),
        getOrdersByClient: async (_, { client }, ctx) => getOrdersByClient(client, ctx),
        getOrdersByStatus: async (_, { status }, ctx) => getOrdersByStatus(status, ctx),
        getOrderById: async (_, { id }, ctx) => getOrderById(id, ctx),

        //? Advance Search Queries
        getBestClients: async (_, { }, ctx) => getBestClients(ctx),
        getBestSellers: async (_, { }, ctx) => getBestSellers(ctx),
        getProductsByName: async (_, { text }, ctx) => getProductsByName(text, ctx),
        getRecentActivity: async (_, { }, ctx) => getRecentActivity(ctx),
        getGeneralActivity: async (_, { }, ctx) => getGeneralActivity(ctx),
    },
    Mutation: {
        //* User Mutations
        createUser: async (_, { input }) => createUser(input),
        authenticateUser: async (_, { input }) => authUser(input),
        updateUser: async (_, { input }, ctx) => updateUser(input, ctx),
        changePassword: async (_, { input }, ctx) => changePassword(input, ctx),

        //^ Product Mutations
        createProduct: async (_, { input }, ctx ) => createProduct(input, ctx),
        updateProduct: async (_, { id, input }, ctx) => updateProduct(id, input, ctx),
        deleteProduct: async (_, { id }, ctx ) => deleteProduct(id, ctx),

        //& Client Mutations
        createClient: async (_, { input }, ctx ) => createClient(input, ctx), 
        updateClient: async (_, { id, input }, ctx) => updateClient(id, input, ctx),
        deleteClient: async (_, { id }, ctx) => deleteClient(id, ctx),

        //~ Order Mutations
        createOrder: async (_, { input }, ctx) => createOrder(input, ctx),
        updateOrder: async (_, { id, input }, ctx) => updateOrder(id, input, ctx),
        deleteOrder: async (_, { id }, ctx) => deleteOrder(id, ctx),
    }, 
    // Complex resolvers
    RecentActivity: {
        __resolveType(obj) {
            if ("client" in obj && "total" in obj) {
                return "Order";
            }
            if ("price" in obj && "stock" in obj) {
                return "Product";
            }
            if ("email" in obj && !("price" in obj)) {
                return "Client";
            }
            return null;
        },
    }
};

export default resolvers;