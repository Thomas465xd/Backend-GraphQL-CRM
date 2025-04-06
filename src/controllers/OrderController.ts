import { ApolloError } from "apollo-server-express";
import Client from "../models/Client";
import Order from "../models/Order";
import Product from "../models/Product";

type OrderInput = {
    order: { product: string; quantity: number }[];
    total?: number;
    totalWithDiscount?: number;
    client: string;
    seller: string;
    status?: 'PENDING' | 'COMPLETED' | 'CANCELED';
}

export const createOrder = async (input: OrderInput, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const { client } = input;

        // Verify if the client exists
        const clientExists = await Client.findById(client);
        if(!clientExists) {
            throw new ApolloError("Client not found", "NOT_FOUND", {
                statusCode: 404 
            });
        }

        // Verify if the client belongs to the user
        if(clientExists.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization to perform this action", "UNAUTHORIZED", {
                statusCode: 401
            })
        }

        // Verify if the products exist and check stock
        for await (const item of input.order) {
            const { product } = item;
            const productExists = await Product.findById(product);
            if(!productExists) {
                throw new ApolloError("Product not found", "NOT_FOUND", {
                    statusCode: 404
                });
            }
            if(productExists.stock < item.quantity) {
                throw new ApolloError("Insufficient stock", "STOCK_ERROR", {
                    statusCode: 400
                });
            }

            // Update the stock of the product
            productExists.stock -= item.quantity;
            await productExists.save();
        }

        // Calculate the total
        let total = 0;
        for await (const item of input.order) {
            // Check if the product exists and calculate the total
            const { product, quantity } = item;
            const productExists = await Product.findById(product);
            if(productExists) {
                total += productExists.price * quantity;
            }
        };

        input.total = total;

        //TODO : Add total with discount
        let totalWithDiscount = 0;
        for await (const item of input.order) {
            const { product, quantity } = item;
            const productExists = await Product.findById(product);
            if(productExists) {
                totalWithDiscount += productExists.priceWithDiscount * quantity;
            }
        }

        input.totalWithDiscount = totalWithDiscount;

        // Create the order
        const newOrder = new Order(input); 

        // Asign Seller to the order
        newOrder.seller = ctx.user.id; 

        // Save the order to the DB
        const result = await newOrder.save();
        return result;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error Creating Order", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}