import { Context, RouterContext } from "../Dependencies/Dependendcies.ts";
import { ProductsModel } from "../Model/ProductsModel.ts";
import { guardarImagen, actualizarImagen, actualizarImagenConCambioCarpeta } from "./ImagenCOntroller.ts";
import { CreateFolderController, eliminarCarpeta } from "./FolderController.ts";
import { z } from "../Dependencies/Dependendcies.ts";
import { XLSX } from "../Dependencies/Dependendcies.ts";

// Agregar esta línea al inicio del archivo para asegurar el acceso a Deno
// @ts-ignore
// deno-lint-ignore-file
const ProductSchema = z.object({
  id_producto: z.coerce.number().min(1).optional(),
  imagen_url: z.string().max(255).optional(),
  medida: z.string().min(1),
  color: z.string().min(1),
  talla: z.string().min(1),
  categoria: z.string().min(1),
  precio: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
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

    // Agregar nombreCarpeta extraído de imagen_url
    const productosConCarpeta = listaProductos.map(producto => {
      let nombreCarpeta = "";
      if (producto.imagen_url && producto.imagen_url.startsWith("uploads/")) {
        const partes = producto.imagen_url.split("/");
        if (partes.length > 2) {
          nombreCarpeta = partes[1]; // uploads/nombreCarpeta/imagen.jpg
        }
      }
      return { ...producto, nombreCarpeta };
    });

    response.status = 200;
    response.body = {
      success: true,
      data: productosConCarpeta,
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

export const getProductByID = async (ctx: RouterContext<"/products/:id">) => {
  const { response, params } = ctx;
  try {
    const id = params?.id ? Number(params.id) : null;
    if (!id || isNaN(id)) {
      response.status = 400;
      response.body = {
        success: false,
        message: "ID inválido"
      };
      return;
    }
    const objProductos = new ProductsModel();
    const producto = await objProductos.listarProductoByID(id);
    if (!producto) {
      response.status = 404;
      response.body = {
        success: false,
        message: "Producto no encontrado"
      };
      return;
    }
    let nombreCarpeta = "";
    if (producto.imagen_url && producto.imagen_url.startsWith("uploads/")) {
      const partes = producto.imagen_url.split("/");
      if (partes.length > 2) {
        nombreCarpeta = partes[1];
      }
    }
    response.status = 200;
    response.body = {
      success: true,
      data: { ...producto, nombreCarpeta }
    };
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// POST - Crear nuevo producto con imagen
export const createProduct = async (ctx: Context) => {
  const { response, request } = ctx;

  try {
    const contentLength = request.headers.get("Content-Length");
    if (contentLength === "0") {
      response.status = 400;
      response.body = {
        success: false,
        message: "El cuerpo de la solicitud está vacío"
      };
      return;
    }

    const body = await request.body.formData();

    const data: Record<string, unknown> = {};
    let imagen_url = "sin_imagen";
    let imagenFile: File | null = null;
    let categoria = "";
    let talla = "";
    let nombreCarpeta = "";

    for (const [key, value] of body.entries()) {
      if (typeof value === "string") {
        if (value.trim() !== "") {
          data[key] = value;
          if (key === "categoria") categoria = value;
          if (key === "talla") talla = value;
        }
      } else {
        if (value && value.name && value.name.trim() !== "") {
          imagenFile = value;
          data[key] = value.name;
        }
      }
    }

    // Crear la carpeta única y obtener el nombreCarpeta
    const folderResult = await CreateFolderController(categoria, talla);
    if (!folderResult.success || !folderResult.nombreCarpeta) {
      response.status = 500;
      response.body = {
        success: false,
        message: "No se pudo crear la carpeta para la imagen"
      };
      return;
    }
    nombreCarpeta = folderResult.nombreCarpeta;

    // Validar datos (sin imagen)
    const validated = ProductSchema.parse(data);

    // Manejo de la imagen usando la nueva lógica
    if (imagenFile) {
      // Guardar la imagen en la carpeta única
      const resultado = await guardarImagen(imagenFile, nombreCarpeta);
      if (resultado.success && resultado.ruta) {
        imagen_url = resultado.ruta;
      } else {
        response.status = 500;
        response.body = {
          success: false,
          message: "Error al guardar la imagen: " + (resultado.message || "Error desconocido")
        };
        return;
      }
    }

    // Construir el producto para el modelo
    const producto = {
      ...validated,
      imagen_url,
      categoria,
      talla
    };

    const ObjProduct = new ProductsModel(producto);
    const resultado = await ObjProduct.crearProducto();

    if (resultado.success) {
      response.status = 201;
      response.body = {
        success: true,
        message: "Producto creado exitosamente",
        data: resultado.product || producto,
        nombreCarpeta // <-- Devolver al frontend
      };
    } else {
      response.status = 400;
      response.body = {
        success: false,
        message: "Producto ya existe en la base de datos " + resultado.message,
      };
    }
  } catch (error) {
    console.error("Error en createProduct:", error);
    if (error instanceof z.ZodError) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos inválidos",
        errors: error.format(),
      };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      };
    }
  }
};
// PUT - Actualizar producto
export const updateProduct = async (ctx: Context) => {
  const { response, request } = ctx;

  try {
    const contentLength = request.headers.get("Content-Length");
    if (contentLength === "0") {
      response.status = 400;
      response.body = {
        success: false,
        message: "El cuerpo de la solicitud está vacío"
      };
      return;
    }

    const body = await request.body.formData();

    const data: Record<string, unknown> = {};
    let imagen_url = "sin_imagen";
    let imagenFile: File | null = null;
    let categoria = "";
    let talla = "";
    let localdate = "";

    for (const [key, value] of body.entries()) {
      if (typeof value === "string") {
        if (value.trim() !== "") {
          data[key] = value;
          if (key === "categoria") categoria = value;
          if (key === "talla") talla = value;
          if (key === "localdate") localdate = value;
        }
      } else {
        if (value && value.name && value.name.trim() !== "") {
          imagenFile = value;
          data[key] = value.name;
        }
      }
    }

    if (!localdate) {
      localdate = new Date().toISOString();
      data["localdate"] = localdate;
    }

    // Validar datos (sin imagen)
    const validated = ProductSchema.parse(data);

    // Verificar que el producto existe antes de actualizar por ID
    const idProducto = data.id_producto;
    if (!idProducto) {
      response.status = 400;
      response.body = {
        success: false,
        message: "ID del producto es requerido para actualizar"
      };
      return;
    }

    // Instanciar con todos los campos requeridos pero vacíos excepto id_producto
    const ObjProductCheck = new ProductsModel({
      id_producto: Number(idProducto),
      imagen_url: "",
      medida: "",
      color: "",
      talla: "",
      categoria: "",
      precio: 0,
      stock: 0
    });
    const productosExistentes = await ObjProductCheck.listarProductos();
    const productoExistente = productosExistentes.find(p => p.id_producto === Number(idProducto));

    if (!productoExistente) {
      response.status = 404;
      response.body = {
        success: false,
        message: "Producto no encontrado con ese ID"
      };
      return;
    }

    // Verificar si cambió la carpeta (cambio de categoria, talla o localdate) y si hay nueva imagen
    const cambioCarpeta = productoExistente.categoria !== categoria || productoExistente.talla !== talla;
    const hayNuevaImagen = imagenFile !== null;


    // Determinar el nombre de la carpeta a usar para la imagen
    let nombreCarpetaFinal = categoria;
    if (hayNuevaImagen) {
      // Verificar si la carpeta existe
      const urlActual = new URL(import.meta.url);
      const raizProyecto = new URL("../", urlActual).pathname;
      // @ts-ignore
      const rutaCarpeta = `${raizProyecto}uploads/${categoria}`;
      let carpetaExiste = true;
      try {
        // @ts-ignore
        await Deno.stat(rutaCarpeta);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          carpetaExiste = false;
        } else {
          throw error;
        }
      }
      if (!carpetaExiste) {
        // Generar carpeta única con UUID
        const folderResult = await CreateFolderController(categoria, talla);
        if (folderResult.success && folderResult.nombreCarpeta) {
          nombreCarpetaFinal = folderResult.nombreCarpeta;
        }
      }
    }
    // --- FIN MODIFICACIÓN ---

    if (cambioCarpeta && hayNuevaImagen && imagenFile) {
      // Caso especial: cambio de carpeta y nueva imagen
      const resultadoImagen = await actualizarImagenConCambioCarpeta(
        imagenFile,
        nombreCarpetaFinal,
        productoExistente.categoria
      );
      if (resultadoImagen.success) {
        imagen_url = resultadoImagen.ruta || productoExistente.imagen_url;
      } else {
        response.status = 500;
        response.body = {
          success: false,
          message: resultadoImagen.message
        };
        return;
      }
    } else {
      // Caso normal: solo cambio de carpeta O solo nueva imagen
      const resultadoImagen = await actualizarImagen(
        imagenFile,
        nombreCarpetaFinal,
        productoExistente.categoria,
        productoExistente.imagen_url
      );
      if (resultadoImagen.success) {
        imagen_url = resultadoImagen.ruta || productoExistente.imagen_url;
      } else {
        response.status = 500;
        response.body = {
          success: false,
          message: resultadoImagen.message
        };
        return;
      }
    }

    // Construir el producto actualizado
    const productoActualizado = {
      ...validated,
      imagen_url,
      id_producto: Number(idProducto),
      categoria,
      talla
      // localdate NO se guarda en el modelo ni en la base de datos
    };

    // Usar el método actualizarProducto del modelo
    const ObjProduct = new ProductsModel(productoActualizado);
    const resultado = await ObjProduct.actualizarProducto();

    if (resultado.success) {
      response.status = 200;
      response.body = {
        success: true,
        message: resultado.message,
        data: productoActualizado
      };
    } else {
      response.status = 400;
      response.body = {
        success: false,
        message: resultado.message
      };
    }

  } catch (error) {
    console.error("Error en updateProduct:", error);
    if (error instanceof z.ZodError) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos inválidos",
        errors: error.format(),
      };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      };
    }
  }
};
export const deleteProduct = async (ctx: RouterContext<"/products/:id">) => {
  const { response, params, request } = ctx;

  try {
    const id_producto = parseInt(params.id);
    if (!id_producto || id_producto <= 0) {
      response.status = 400;
      response.body = {
        success: false,
        message: "ID del producto inválido",
      };
      return;
    }

    // Obtener nombreCarpeta del body o query
    let nombreCarpeta = "";
    if (request.url.searchParams.has("nombreCarpeta")) {
      nombreCarpeta = request.url.searchParams.get("nombreCarpeta") || "";
    } else {
      try {
        const body = await request.body({ type: "json" }).value;
        nombreCarpeta = body.nombreCarpeta || "";
      } catch (_) { }
    }

    if (!nombreCarpeta) {
      response.status = 400;
      response.body = {
        success: false,
        message: "nombreCarpeta es requerido para eliminar la carpeta de imágenes"
      };
      return;
    }

    // Eliminar el producto de la base de datos
    const objProducto = new ProductsModel();
    const result = await objProducto.eliminarProducto(id_producto);

    if (result.success) {
      // Eliminar la carpeta de imágenes
      try {
        await eliminarCarpeta(nombreCarpeta);
      } catch (error) {
        console.warn("No se pudo eliminar la carpeta de imágenes:", error);
      }
      response.status = 200;
      response.body = {
        success: true,
        message: "Producto y carpeta eliminados exitosamente",
      };
    } else {
      response.status = 400;
      response.body = {
        success: false,
        message: "Error al eliminar el Producto: " + result.message,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      response.status = 500;
      response.body = {
        success: false,
        message: "Error interno del servidor: " + error.message,
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
};

export const postUploadFromXLSX = async (ctx: Context) => {
  const { response, request } = ctx;

  try {
    const contentLength = request.headers.get("Content-Length");
    if (contentLength === "0") {
      response.status = 400;
      response.body = {
        success: false,
        message: "El cuerpo de la solicitud está vacío"
      };
      return;
    }

    const formData = await request.body.formData();

    const xlsxFile = formData.get("File") as File;

    console.log("File Name:", xlsxFile.name);
    console.log("File Type:", xlsxFile.type);
    console.log("File Size:", xlsxFile.size);

    const arrayBuffer = await xlsxFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);


    for (const row of jsonData) {
      const validated = ProductSchema.parse(row);
      const productData = {
        ...validated,
        imagen_url: row.imagen_url,
      };

      const objProducto = new ProductsModel(productData)
      const result = await objProducto.crearProducto();

      console.log(result)

      if (!result.success) {
        response.status = 400
        response.body = {
          success: false,
          message: "Error al agregar entrada " + jsonData.indexOf(row)
        }

      }
    }

    response.status = 200
    response.body = {
      success: true,
      message: "Productos agregados correctamente"
    }


  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos invalidos",
        errors: error.format(),
      }
    } else {
      response.status = 500;
      response.body = {
        success: false,
        message: "Error interno de servidor",
      }
    }
  }
}
