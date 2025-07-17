
// ============================================================================
// FUNCIONES PRINCIPALES PARA MANEJO DE IMÁGENES
// ============================================================================

/**
 * Guarda una nueva imagen en el sistema de archivos
 * @param imagen - Archivo de imagen a guardar
 * @param nombreCarpeta - Nombre único de la carpeta para guardar la imagen
 * @returns Resultado de la operación con ruta de la imagen guardada
 */
export async function guardarImagen(
  imagen: File,
  nombreCarpeta: string
): Promise<{ success: boolean; ruta?: string; message?: string }> {
  try {
    // 1. Crear carpeta si no existe
    const urlActual = new URL(import.meta.url);
    const raizProyecto = new URL("../", urlActual).pathname;
    const rutaCarpeta = `${raizProyecto}uploads/${nombreCarpeta}`;
    try {
      await Deno.stat(rutaCarpeta);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        await Deno.mkdir(rutaCarpeta, { recursive: true });
      }
    }
    // 2. Preparar datos de la imagen
    const arrayBuffer = await imagen.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // 3. Crear nombre
    const nombreArchivo = `imagen_${imagen.name}`;
    const rutaAbsoluta = `${rutaCarpeta}/${nombreArchivo}`;
    const rutaRelativa = `uploads/${nombreCarpeta}/${nombreArchivo}`;
    // 4. Guardar la imagen físicamente
    await Deno.writeFile(rutaAbsoluta, bytes);
    return { success: true, ruta: rutaRelativa };
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    return {
      success: false,
      message: `Error al guardar imagen: ${error.message}`
    };
  }
}

/**
 * Elimina una imagen anterior del sistema de archivos
 * @param rutaImagen - Ruta relativa de la imagen a eliminar
 * @returns Resultado de la operación
 */
export async function eliminarImagenAnterior(
  rutaImagen: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Si no hay imagen anterior, no hacer nada
    if (!rutaImagen || rutaImagen === "sin_imagen") {
      return { success: true, message: "No hay imagen anterior para eliminar" };
    }

    // Obtener la ruta absoluta de la imagen
    const urlActual = new URL(import.meta.url);
    const raizProyecto = new URL("../", urlActual).pathname;
    const rutaAbsoluta = `${raizProyecto}${rutaImagen}`;

    // Verificar si el archivo existe antes de eliminarlo
    try {
      await Deno.stat(rutaAbsoluta);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return { success: true, message: "La imagen anterior ya no existe" };
      }
      throw error;
    }

    // Eliminar el archivo
    await Deno.remove(rutaAbsoluta);
    
    return { success: true, message: "Imagen anterior eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar imagen anterior:", error);
    return { 
      success: false, 
      message: `Error al eliminar imagen anterior: ${error.message}` 
    };
  }
}

/**
 * Elimina todas las imágenes de una carpeta específica
 * @param nombreCarpeta - Nombre único de la carpeta a eliminar
 * @returns Resultado de la operación
 */
export async function eliminarTodasImagenesCarpeta(
  nombreCarpeta: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Obtener la ruta absoluta de la carpeta
    const urlActual = new URL(import.meta.url);
    const raizProyecto = new URL("../", urlActual).pathname;
    const rutaCarpeta = `${raizProyecto}uploads/${nombreCarpeta}`;

    // Verificar si la carpeta existe
    try {
      await Deno.stat(rutaCarpeta);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return { success: true, message: "La carpeta no existe" };
      }
      throw error;
    }

    // Leer todos los archivos en la carpeta
    const archivos = [];
    for await (const entry of Deno.readDir(rutaCarpeta)) {
      if (entry.isFile) {
        archivos.push(entry.name);
      }
    }

    // Eliminar todos los archivos
    for (const archivo of archivos) {
      const rutaArchivo = `${rutaCarpeta}/${archivo}`;
      try {
        await Deno.remove(rutaArchivo);
      } catch (error) {
        console.warn(`No se pudo eliminar ${archivo}:`, error);
      }
    }

    return { 
      success: true, 
      message: `Se eliminaron ${archivos.length} archivos de la carpeta ${nombreCarpeta}` 
    };
  } catch (error) {
    console.error("Error al eliminar imágenes de la carpeta:", error);
    return { 
      success: false, 
      message: `Error al eliminar imágenes de la carpeta: ${error.message}` 
    };
  }
}

/**
 * Función específica para manejar actualización con nueva imagen y posible cambio de carpeta
 * @param imagenFile - Nueva imagen a guardar
 * @param nombreCarpeta - Nombre único de la carpeta para la nueva imagen
 * @param nombreCarpetaAnterior - Nombre único de la carpeta anterior
 * @param nombreCarpetaAnterior - Nombre único de la carpeta anterior
 * @returns Resultado de la operación con ruta de la imagen final
 */
export async function actualizarImagenConCambioCarpeta(
  imagenFile: File,
  nombreCarpeta: string,
  nombreCarpetaAnterior: string
): Promise<{ success: boolean; ruta?: string; message?: string }> {
  try {
    // 1. Eliminar todas las imágenes de la carpeta anterior
    const resultadoEliminar = await eliminarTodasImagenesCarpeta(nombreCarpetaAnterior);
    if (!resultadoEliminar.success) {
      console.warn("Advertencia al eliminar imágenes:", resultadoEliminar.message);
    }

    // 2. Guardar la nueva imagen en la nueva carpeta
    const resultado = await guardarImagen(imagenFile, nombreCarpeta);
    if (resultado.success && resultado.ruta) {
      return { 
        success: true, 
        ruta: resultado.ruta,
        message: "Imagen actualizada exitosamente con cambio de carpeta" 
      };
    } else {
      return { 
        success: false, 
        message: "Error al guardar la nueva imagen: " + (resultado.message || "Error desconocido") 
      };
    }
  } catch (error) {
    console.error("Error al actualizar imagen con cambio de carpeta:", error);
    return { 
      success: false, 
      message: `Error al actualizar imagen con cambio de carpeta: ${error.message}` 
    };
  }
}

/**
 * Función principal para manejar la actualización de imágenes
 * Maneja la lógica completa: eliminar imagen anterior y guardar nueva
 * @param imagenFile - Nueva imagen a guardar (opcional)
 * @param nombreCarpeta - Nombre único de la carpeta para la nueva imagen
 * @param nombreCarpetaAnterior - Nombre único de la carpeta anterior
 * @param imagenAnterior - Ruta de la imagen anterior
 * @returns Resultado de la operación con ruta de la imagen final
 */
export async function actualizarImagen(
  imagenFile: File | null, 
  nombreCarpeta: string, 
  nombreCarpetaAnterior: string, 
  imagenAnterior: string
): Promise<{ success: boolean; ruta?: string; message?: string }> {
  try {
    // Si no se envía nueva imagen, mantener la anterior
    if (!imagenFile) {
      return { 
        success: true, 
        ruta: imagenAnterior,
        message: "Se mantiene la imagen anterior" 
      };
    }

    // Eliminar imagen anterior si existe
    if (imagenAnterior && imagenAnterior !== "sin_imagen") {
      const resultadoEliminar = await eliminarImagenAnterior(imagenAnterior);
      if (!resultadoEliminar.success) {
        console.warn("Advertencia al eliminar imagen anterior:", resultadoEliminar.message);
      }
    }

    // Guardar nueva imagen
    const resultado = await guardarImagen(imagenFile, nombreCarpeta);
    if (resultado.success && resultado.ruta) {
      return { 
        success: true, 
        ruta: resultado.ruta,
        message: "Imagen actualizada exitosamente" 
      };
    } else {
      return { 
        success: false, 
        message: "Error al guardar la nueva imagen: " + (resultado.message || "Error desconocido") 
      };
    }
  } catch (error) {
    console.error("Error al actualizar imagen:", error);
    return { 
      success: false, 
      message: `Error al actualizar imagen: ${error.message}` 
    };
  }
}
