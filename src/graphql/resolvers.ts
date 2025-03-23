import { authUser, createUser, getUser } from "../controllers/authController";

const resolvers = {
    Query: {
        getUser: async (_, { token } ) => getUser(token),
    },
    Mutation: {
        createUser: async (_, { input }) => createUser(input),
        authenticateUser: async (_, { input }) => authUser(input),
    }
};

export default resolvers;
