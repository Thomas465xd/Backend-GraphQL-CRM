import { ApolloError } from "apollo-server-express";
import Order from "../models/Order";
import Product from "../models/Product";
import Client from "../models/Client";

type Context = {
    user: {
        id: string; 
    }
}

/*
 * Retrieves the top sellers based on completed orders.
 * 
 * This function performs an aggregation on the "Order" collection to identify the top sellers
 * by filtering completed orders, grouping them by seller ID, and calculating the total sales
 * and number of orders for each seller. It then joins the results with the "users" collection
 * to retrieve seller details and sorts the sellers by total sales in descending order. The
 * function limits the results to the top sellers and returns the seller information along
 * with their total sales and order count.
 *
 * @returns {Promise<Array>} An array of top sellers with their details, total sales, and order count.
 * @throws {ApolloError} Throws an ApolloError if any error occurs during the aggregation process.
 */
export const getBestSellers = async (ctx: Context) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const sellers = await Order.aggregate([
            {
                $match: { status: "COMPLETED" }
            }, 
            {
                $group: {
                    _id: "$seller", // Agrupamos por ID de vendedor
                    totalSales: { $sum: "$total" }, // Suma del total vendido (lo creamos)
                    totalOrders: { $sum: 1 } // Contamos la cantidad de pedidos (lo creamos)
                }
            },
            {
                $lookup: {
                    from: "users", // Relacionamos con la colección de usuarios (vendedores)
                    localField: "_id", // El campo para hacer la relación
                    foreignField: "_id", // El campo de referencia en users
                    as: "seller" // El resultado se guardará en seller
                }
            }, 
            {
                $unwind: "$seller" // Desenrollamos el array resultante de seller
            },
            {
                $sort: { totalSales: -1 } // Orden descendente por total vendido
            },
            {
                $limit: 3 // Top 10 vendedores (opcional)
            },
            {
                $project: {
                    seller: 1, // Devuelve la información del vendedor
                    totalOrders: 1, // El total de pedidos
                    totalSales: 1 // El total vendido
                }
            }
        ])

        return sellers;
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching best sellers", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

/*
 * Retrieves the top 10 clients based on their total spending on completed orders.
 * The function aggregates order data, groups by client ID, and calculates
 * the total amount spent and the total number of orders for each client.
 * It then performs a lookup to join the client details, sorts the clients
 * by total spending in descending order, and limits the results to the top 10.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of top clients,
 * each containing client information, total orders, and total spent.
 * @throws {ApolloError} If there is an error fetching the best clients,
 * an ApolloError is thrown with an appropriate message and status code.
 */
export const getBestClients = async (ctx: Context) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const clients = await Order.aggregate([
            {
                $match: { status: "COMPLETED" }
            },
            {
                $group: {
                    _id: "$client", // Agrupamos por ID de cliente
                    totalSpent: { $sum: "$total" }, // Suma del total gastado
                    totalOrders: { $sum: 1 } // Contamos la cantidad de pedidos
                }
            },
            {
                $lookup: {
                    from: "clients", // Relacionamos con la colección de clientes
                    localField: "_id", // El campo para hacer la relación
                    foreignField: "_id", // El campo de referencia en clients
                    as: "client"
                }
            },
            {
                $unwind: "$client" // Desenrollamos el array resultante de client
            },
            {
                $sort: { totalSpent: -1 } // Orden descendente por total gastado
            },
            {
                $limit: 10 // Top 10 clientes (opcional)
            },
            {
                $project: {
                    client: 1, // Devuelve la información del cliente
                    totalOrders: 1, // El total de pedidos
                    totalSpent: 1 // El total gastado
                }
            }
        ]);

        return clients;
    } catch (error) {
        console.log("Error: ", error);
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching best clients", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

/*
 * Busca productos por nombre.
 * @param {string} text - El texto a buscar.
 * @returns {Promise<Product[]>} - Un array de productos que coinciden con el texto.
 */
export const getProductsByName = async (text: string, ctx: Context) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const products = await Product.find({
            $text: {
                $search: text,
                $caseSensitive: false,
            }
        }).sort({
            score: { 
                $meta: "textScore" 
            } 
        }).limit(10); // Ordena según la relevancia del texto

        return products;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching products by name", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

/*
 * Get Most Recent Activity  
*/
export const getRecentActivity = async (ctx: Context) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const limit = 1;

        // Fetch recent orders
        const recentOrders = await Order.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            { $addFields: { type: "Order" } }
        ]);

        // Fetch recent products
        const recentProducts = await Product.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            { $addFields: { type: "Product" } }
        ]);

        // Fetch recent clients
        const recentClients = await Client.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            { $addFields: { type: "Client" } }
        ]);

        // Combine and sort all results by createdAt
        const combined = [...recentOrders, ...recentProducts, ...recentClients]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Optional: limit final result
        const recentActivity = combined.slice(0, 10);

        return recentActivity;

    } catch (error) {
        console.log("Error: ", error);

        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching recent activity", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
};