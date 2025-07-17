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

export const getProducts = async (ctx: Context) => {

    const { response } = ctx;

    try {
        const objProductos = new ProductsModel();
        const listaProductos = await objProductos.listarProductos(); 

        if (!listaProductos || listaProductos.length === 0) {
            response.status = 400;
            response.body = {
                success: false,
                message: "no se encontraron productos en la base de datos",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            data: listaProductos,
        };
    } catch (error) {

        if (error instanceof Error) {
            response.status = 500;
            response.body = {
                success: false,
                message: "Error interno del servidor",
                error: error.message,
            };
        } else {
            response.status = 500;
            response.body = {
                success: false,
                message: "Error interno del servidor",
                error: String(error),
            };
        }
    }

}
export const createProduct = async (ctx: Context) => {}
export const updateProduct = async (ctx: Context) => {}
export const deleteProduct = async (ctx: RouterContext<"/products/:id">) => {}
