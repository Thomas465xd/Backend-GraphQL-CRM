import { ApolloError } from "apollo-server-express";
import Product from "../models/Product";

type ProductInput = {
    name: string;
    stock: number;
    price: number;
    discount?: number;
    description?: string;
}

//? Get All Products
export const getProducts = async () => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        return products;
    } catch (error) {
        throw new ApolloError("Error fetching products", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Get a single Product By ID
export const getProductById = async (id: string) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new ApolloError("Product not found", "NOT_FOUND", {
                statusCode: 404,
            });
        }

        return product;
    } catch (error) {
        throw new ApolloError("Error fetching product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}

//? Create New Product
export const createProduct = async (input : ProductInput) => {
    try {
        // Validate Product

        // Create a new Product Instance
        const product = new Product(input)

        // Save Product in DB
        const result = await product.save();
        return result;
    } catch (error) {
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
        throw new ApolloError("Error deleting product", "INTERNAL_SERVER_ERROR", {
            statusCode: 500,
        });
    }
}