import Conexion from "./Conexion.ts";

export interface ProductData {
    id_producto: number | null;
    imagen_url: string;
    medida: string;
    color: string;
    talla: string;
    categoria: string;
    precio: number;
    stock: number;
}

export class ProductsModel {

    public objProducts: ProductData | null;

    constructor(ObjProducts: ProductData | null = null) {
        this.objProducts = ObjProducts;
    }

    public async listarProductos(): Promise<ProductData[]> {
        try {
            const result = await Conexion.execute(`SELECT * FROM Producto`);
            if (!result || !result.rows) {
                console.warn("La consulta no regreso resultados");
                return [];
            }

            return result.rows as ProductData[];
        } catch (error) {
            console.log("Error al seleccionar productos", error);
            throw new Error("No se pudieron obtener datos y/o productos");
        }
    }

    public async crearProducto(): Promise<{success:boolean, message:string, product?:Record<string, unknown>}> {}

    public async actualizarProducto(): Promise<{success:boolean, message:string, product?:Record<string, unknown>}> {}

    public async eliminarProducto(id: number): Promise<{success:boolean, message:string, product?:Record<string, unknown>}> {}

}