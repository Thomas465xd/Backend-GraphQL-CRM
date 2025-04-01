import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type UserPayLoad = {
    id: Types.ObjectId;
}

export const generateJWT = (payload: UserPayLoad) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: "7d", // Token expiration time
    })

    return token; 
}