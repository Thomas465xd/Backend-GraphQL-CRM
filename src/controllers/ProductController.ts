import { ApolloError } from "apollo-server-express";
import Product from "../models/Product";

type ProductInput = {
    name: string;
    stock: number;
    price: number;
    discount?: number;
    description?: string;
}

type Context = {
    user: {
        id: string; 
    }
}

//? Get All Products
export const getProducts = async (ctx: Context) => {
    try {
        // Check if the user is authenticated
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const products = await Product.find({}).sort({ createdAt: -1 });
        return products;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching products", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Get Products By Seller
export const getProductsBySeller = async (ctx) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Get Products by Seller
        const userId = ctx.user.id;

        const products = await Product.find({ seller: userId }).sort({ createdAt: -1 });
        if(!products) {
            throw new ApolloError("No Products found", "NOT_FOUND", {
                statusCode: 404, 
            })
        }

        return products; 
    } catch (error) {
        
    }
}

//? Get a single Product By ID
export const getProductById = async (id: string, ctx: Context) => {
    try {
        if(!ctx.user) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            throw new ApolloError("Product not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        return product;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error fetching product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Create New Product
export const createProduct = async (input : ProductInput, ctx : Context) => {
    try {
        // Check if user is authenticated
        if(!ctx) {
            throw new ApolloError("User not authenticated", "UNAUTHORIZED", {
                statusCode: 401,
            });
        }

        // Create a new Product Instance
        const product = new Product(input)

        product.seller = ctx.user.id; // Assign seller to the product

        // transform discount to percentage and assign product price with discount
        if(input.discount) {
            product.priceWithDiscount = input.price - (input.price * (input.discount / 100));
        }

        // Save Product in DB
        const result = await product.save();
        return result;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error creating product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Update a Product
export const updateProduct = async (id: string, input: ProductInput) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new ApolloError("Product not found", "NOT_FOUND", {
                statusCode: 404, 
            })
        }

        // Update Product
        const updatedProduct = await Product.findOneAndUpdate({ _id: id }, input, { new: true });
        return updatedProduct;
    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }

        throw new ApolloError("Error updating product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Delete a Product
export const deleteProduct = async (id: string) => {
    try {
        const product = await Product.findById(id);
        if(!product) {
            throw new ApolloError("Product not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        // Delete Product
        await Product.findOneAndDelete({ _id: id });
        return `Product deleted successfully`;

    } catch (error) {
        console.log("Error: ", error);
        
        // Check if it's already an ApolloError, if so, rethrow it
        if (error instanceof ApolloError) {
            throw error;
        }
        
        throw new ApolloError("Error deleting product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

// * ADVANCE SEARCH METHODS * //

export const getProductsByName = async (text: string) => {
    try {
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