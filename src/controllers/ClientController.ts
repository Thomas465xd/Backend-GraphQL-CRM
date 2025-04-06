import { ApolloError } from "apollo-server-express"
import Client from "../models/Client";

type ClientInput = {
    name: string,
    surname: string,
    businessName: string,
    role: string,
    email: string,
    phone: string
}

export const getClients = async () => {
    try {
        const clients = await Client.find({}).sort({ createdAt: -1 });
        return clients
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error Fetching Clients", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

export const getSellerClients = async (ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const { id: seller } = ctx.user;

        const clients = await Client.find({ seller }).sort({ createdAt: -1 });
        return clients
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error Fetching Clients", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

export const getClientById = async (id: string, ctx) => {
    try {
        // Review if the client exists
        const client = await Client.findById(id);
        if (!client) {
            throw new ApolloError("Client not found", "NOT_FOUND", { statusCode: 404 });
        }

        // Review if the client belongs to the user
        if (client.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You dont have Authorization", "UNAUTHORIZED", { statusCode: 401 });
        }

        return client;

    } catch (error) {
        // Si ya es un ApolloError, lo relanzamos
        if (error instanceof ApolloError) {
            throw error;
        }

        // Si es otro tipo de error, lanzamos 500
        throw new ApolloError("Error Fetching Client", "INTERNAL_SERVER_ERROR", { statusCode: 500 });
    }
};


export const createClient = async (input, ctx) => {
    try {
        // Verificar que el Usuario este Logueado
        if(!ctx.user){
            throw new Error('You dont have Authorization');
        }

        // Validate Input
        const { email } = input;

        // Check if client already exists
        const client = await Client.findOne({ email, seller: input.seller });
        if (client) {
            throw new ApolloError("Client already exists for this seller", "CLIENT_EXISTS", {
                statusCode: 400,
            });
        }

        // Create a new Client Instance
        const newClient = new Client(input);

        // Assign the seller from context
        newClient.seller = ctx.user.id;

        // Save Client in DB
        const result = await newClient.save();
        return result;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        throw new ApolloError("Error Creating Client", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

export const updateClient = async (id: string, input: ClientInput, ctx) => {
    try {
        // Review if the client exists
        const client = await Client.findById(id);
        if(!client) {
            throw new ApolloError("Client not found", "NOT_FOUND", {
                statusCode: 404
            })
        }

        // Review if the client belongs to the auth user
        if (client.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization", "UNAUTHORIZED", {
                statusCode: 401 
            });
        }

        // Update Client
        const updatedClient = await Client.findOneAndUpdate({ _id: id }, input, { new: true });
        return updatedClient

    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error Updating Client", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//^ Delete Client
export const deleteClient = async (id: string, ctx) => {
    try {
        // Review if the client exists
        const client = await Client.findById(id);
        if(!client) {
            throw new ApolloError("Client not found", "NOT_FOUND", {
                statusCode: 404
            })
        }

        // Review if the client belongs to the auth user
        if (client.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization", "UNAUTHORIZED", {
                statusCode: 401 
            });
        }

        // Delete Client
        await Client.findOneAndDelete({ _id: id });
        return "Client deleted Succesfully"
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error Deleting Client", "INTERNAL_SERVER_ERROR", {
            sttusCode: 500
        })
    }
}