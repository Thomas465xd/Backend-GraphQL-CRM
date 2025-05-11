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
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

type Context = {
    user: {
        id: string; 
    }
}

//~ Get All Orders (without discrimination)
export const getOrders = async (ctx: Context) => {
    try {
        //check if the user is authenticated
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const { id } = ctx.user;

        // Get all orders from the DB
        const orders = await Order.find({ seller: id }).sort({ createdAt: -1 }).populate("client");
        return orders;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error fetching orders", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Get Orders by Seller
export const getOrdersBySeller = async (ctx: Context) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Get the user id
        const { id } = ctx.user;

        // Get all orders from the DB
        const orders = await Order.find({ seller: id }).sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error fetching orders", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Get Orders by Client
export const getOrdersByClient = async (client: string, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Check if the client exists
        const clientExists = await Client.findById(client);
        if(!clientExists) {
            throw new ApolloError("Client not found", "NOT_FOUND", {
                statusCode: 404
            });
        }

        // Check if the client belongs to the user
        if(clientExists.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization to perform this action", "UNAUTHORIZED", {
                statusCode: 401
            })
        }

        // Get all orders from the DB
        const orders = await Order.find({ client, seller: ctx.user.id }).sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error fetching orders", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Get Orders by Status
export const getOrdersByStatus = async (status: string, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Check if the status passed is valid
        const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
        if(!validStatuses.includes(status)) {
            throw new ApolloError("Invalid status", "BAD_REQUEST", {
                statusCode: 400
            });
        }

        // Get all orders from the DB
        const orders = await Order.find({ status, seller: ctx.user.id }).sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error fetching orders", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Get Order by ID
export const getOrderById = async (id: string, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Check if the order exists 
        const order = await Order.findById(id);
        if(!order) {
            throw new ApolloError("Order not found", "NOT_FOUND", {
                statusCode: 404
            })
        }

        // Check if the order belongs to the user 
        if(order.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization to perform this action", "UNAUTHORIZED", {
                statusCode: 401
            })
        }

        // Return the order
        return order;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error fetching orders", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Create Order
export const createOrder = async (input: OrderInput, ctx) => {
    try {
        // Check if the user is authenticated
        if (!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const { client } = input;
        console.log(client)

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

//~ Update Order
export const updateOrder = async (id: string, input: OrderInput, ctx) => {
    try {
        // Check if the user is authenticated
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            })
        }

        // Check if the order exists
        const orderExists = await Order.findById(id);
        if(!orderExists) {
            throw new ApolloError("Order not found", "NOT_FOUND", {
                statusCode: 404
            });
        }

        // Check if the client exists
        const { client } = input;
        const clientExists = await Client.findById(client);
        if(!clientExists) {
            throw new ApolloError("Client not found", "NOT_FOUND", {
                statusCode: 404
            })
        }

        // Check if the client & order belongs to the user
        if(clientExists.seller.toString() !== ctx.user.id && orderExists.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization to perform this action", "UNAUTHORIZED", {
                statusCode: 401
            })
        }
        
        // Verify if the products exist and check stock
        if(input.order) {
            for (const item of input.order) {
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

            // Recalculate the total
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
    
            // Update total with discount
            let totalWithDiscount = 0;
            for (const item of input.order) {
                const { product, quantity } = item;
                const productExists = await Product.findById(product);
                if(productExists) {
                    totalWithDiscount += productExists.priceWithDiscount * quantity;
                }
            }
    
            input.totalWithDiscount = totalWithDiscount;
        }

        // Update the order
        const result = await Order.findOneAndUpdate({_id: id}, input, { new: true });
        return result;
    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        // Otherwise, throw a generic error
        throw new ApolloError("Error updating order", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}

//~ Delete Order
export const deleteOrder = async (id: string, ctx) => {
    try {
        // Check if the user is authenticated
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            })
        }

        // Check if the order exists
        const orderExists = await Order.findById(id);
        if(!orderExists) {
            throw new ApolloError("Order not found", "NOT_FOUND", {
                statusCode: 404
            });
        }

        // Check if the order belongs to the user 
        if(orderExists.seller.toString() !== ctx.user.id) {
            throw new ApolloError("You don't have Authorization to perform this action", "UNAUTHORIZED", {
                statusCode: 401
            })
        }

        // Defensive programming: Check if the order is an array
        if (!Array.isArray(orderExists.order)) {
            throw new ApolloError("Order items are invalid", "BAD_REQUEST", {
                statusCode: 400
            });
        }
        

        // Refactor the stock of the products
        for (const item of orderExists.order) {
            const { product, quantity } = item;
            const productExists = await Product.findById(product);
            if(productExists) {
                productExists.stock += quantity;
                await productExists.save();
            }
        }

        // Delete the order
        await Order.findOneAndDelete({ _id: id });
        return "Order deleted successfully";

    } catch (error) {
        console.log("Error: ", error);
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        // Otherwise, throw a generic error
        throw new ApolloError("Error deleting order", "INTERNAL_SERVER_ERROR", {
            statusCode: 500
        });
    }
}