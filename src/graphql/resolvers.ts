import { authUser, createUser } from "../controllers/authController";

const resolvers = {
    Mutation: {
        createUser: async (_, { input }) => createUser(input),
        authenticateUser: async (_, { input }) => authUser(input),
    }
};

export default resolvers;
