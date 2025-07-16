import { Context, RouterContext} from "../Dependencies/Dependendcies.ts";
import { z } from "../Dependencies/Dependendcies.ts";
import { ProductsModel } from "../Model/ProductsModel.ts";

const ProductSchema = z.object({
    id_producto: z.coerce.number().nullable(),
    imagen_url: z.string().max(255),
    medida: z.string().max(50),
    color: z.string().max(30),
    talla: z.string().max(10),
    categoria: z.string().max(50),
    precio: z.coerce.number(), 
    stock: z.coerce.number().int(), 
});

export const getProducts = async (ctx: Context) => {}
export const createProduct = async (ctx: Context) => {}
export const updateProduct = async (ctx: Context) => {}
export const deleteProduct = async (ctx: RouterContext<"/products/:id">) => {}
