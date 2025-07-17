import Conexion from "./Conexion.ts";

export interface ProductData {
    id_producto?: number;
    imagen_url: string;
    medida: string;
    color: string;
    talla: string;
    categoria: string;
    precio: number;
    stock: number;
}

export class ProductsModel {
    private producto: ProductData | null;

    constructor(producto: ProductData | null = null) {
        this.producto = producto;
    }

    // Listar todos los productos
    public async listarProductos(): Promise<ProductData[]> {
        try {
            const query = "SELECT * FROM Producto ORDER BY id_producto DESC";
            const result = await Conexion.execute(query);

            if (!result || !result.rows) {
                return [];
            }

            return result.rows as ProductData[];
        } catch (error) {
            console.error("Error al listar productos:", error);
            throw new Error("Error al obtener productos de la base de datos");
        }
    }

    // Crear nuevo producto
    public async crearProducto(): Promise<{ success: boolean; message: string; product?: Record<string, unknown> }> {
        try {
            if (!this.producto) {
                return {
                    success: false,
                    message: "No hay datos del producto para crear"
                };
            }
            const { imagen_url, medida, color, talla, categoria, precio, stock } = this.producto;

            // Insertar nuevo producto
            const insertQuery = `
                INSERT INTO Producto (imagen_url, medida, color, talla, categoria, precio, stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await Conexion.execute(insertQuery, [
                imagen_url, medida, color, talla, categoria, precio, stock
            ]);

            if (result && result.lastInsertId) {
                return {
                    success: true,
                    message: "Producto creado exitosamente",
                    product: { ...this.producto, id_producto: result.lastInsertId }
                };
            } else {
                return {
                    success: false,
                    message: "Error al insertar en la base de datos"
                };
            }
        } catch (error) {
            console.error("Error al crear producto:", error);
            return {
                success: false,
                message: "Error al crear producto en la base de datos"
            };
        }
    }

    // Actualizar producto existente
    public async actualizarProducto(): Promise<{ success: boolean; message: string; product?: Record<string, unknown> }> {
        try {
            if (!this.producto) {
                return {
                    success: false,
                    message: "No hay datos del producto para actualizar"
                };
            }
            const { id_producto, imagen_url, medida, color, talla, categoria, precio, stock } = this.producto;

            if (!id_producto) {
                return {
                    success: false,
                    message: "ID del producto es requerido para actualizar"
                };
            }

            // Verificar que el producto existe
            const checkQuery = "SELECT id_producto FROM Producto WHERE id_producto = ?";
            const checkResult = await Conexion.execute(checkQuery, [id_producto]);

            if (!checkResult || !checkResult.rows || checkResult.rows.length === 0) {
                return {
                    success: false,
                    message: "Producto no encontrado"
                };
            }

            // Actualizar producto
            const updateQuery = `
                UPDATE Producto 
                SET imagen_url = ?, medida = ?, color = ?, talla = ?, categoria = ?, precio = ?, stock = ?
                WHERE id_producto = ?
            `;

            const result = await Conexion.execute(updateQuery, [
                imagen_url, medida, color, talla, categoria, precio, stock, id_producto
            ]);

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                return {
                    success: true,
                    message: "Producto actualizado exitosamente",
                    product: { ...this.producto }
                };
            } else {
                return {
                    success: false,
                    message: "No se pudo actualizar el producto"
                };
            }
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            return {
                success: false,
                message: "Error al actualizar producto en la base de datos"
            };
        }
    }

    // Eliminar producto
    public async eliminarProducto(id_producto: number): Promise<{ success: boolean, message: string }> {
        try {
            // Verificar que el producto existe
            const checkQuery = "SELECT id_producto FROM Producto WHERE id_producto = ?";
            const checkResult = await Conexion.execute(checkQuery, [id_producto]);

            if (!checkResult || !checkResult.rows || checkResult.rows.length === 0) {
                return {
                    success: false,
                    message: "Producto no encontrado"
                };
            }

            // Eliminar de la base de datos
            const deleteQuery = "DELETE FROM Producto WHERE id_producto = ?";
            const result = await Conexion.execute(deleteQuery, [id_producto]);

            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                return {
                    success: true,
                    message: "Producto eliminado exitosamente"
                };
            } else {
                return {
                    success: false,
                    message: "No se pudo eliminar el producto de la base de datos"
                };
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            return {
                success: false,
                message: "Error al eliminar producto de la base de datos"
            };
        }
    }
}