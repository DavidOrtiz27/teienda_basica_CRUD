
export interface FolderResponse {
    success: boolean;
    message: string;
    rutaAbsoluta?: string;
    rutaRelativa?: string;
    nombreCarpeta?: string;
}

function getRutaEnRaiz(relativa: string): string {
    const urlActual = new URL(import.meta.url);
    const raizProyecto = new URL("../", urlActual).pathname;
    return `${raizProyecto}${relativa}`;
}

// Crear carpeta con nombre único
export async function CreateFolderController(categoria: string, talla: string): Promise<FolderResponse> {
    const uniqueId = crypto.randomUUID();
    const nombreCarpeta = `${categoria}_${talla}_${uniqueId}`;
    const rutaRelativa = `uploads/${nombreCarpeta}`;
    const rutaAbsoluta = getRutaEnRaiz(rutaRelativa);

    try {
        await Deno.stat(rutaAbsoluta);
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            await Deno.mkdir(rutaAbsoluta, { recursive: true });
        }
    }

    return {
        success: true,
        message: `Carpeta lista: ${rutaAbsoluta}`,
        rutaAbsoluta,
        rutaRelativa,
        nombreCarpeta
    };
}

// Renombrar carpeta (por si necesitas cambiar el identificador)
export async function RenombrarCarpetaController(nombreCarpetaAnterior: string, nombreCarpetaNuevo: string): Promise<FolderResponse> {
    try {
        if (nombreCarpetaAnterior === nombreCarpetaNuevo) {
            return {
                success: true,
                message: "El nombre de la carpeta no cambió, no es necesario renombrar"
            };
        }

        const rutaCarpetaAnterior = getRutaEnRaiz(`uploads/${nombreCarpetaAnterior}`);
        const rutaCarpetaNueva = getRutaEnRaiz(`uploads/${nombreCarpetaNuevo}`);

        // Verificar si la carpeta anterior existe
        try {
            await Deno.stat(rutaCarpetaAnterior);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return {
                    success: false,
                    message: "La carpeta anterior no existe"
                };
            }
            throw error;
        }

        // Verificar si la carpeta nueva ya existe
        try {
            await Deno.stat(rutaCarpetaNueva);
            return {
                success: false,
                message: `Ya existe una carpeta con el nombre ${nombreCarpetaNuevo}`
            };
        } catch (error) {
            if (!(error instanceof Deno.errors.NotFound)) {
                throw error;
            }
        }

        // Renombrar la carpeta
        await Deno.rename(rutaCarpetaAnterior, rutaCarpetaNueva);

        return {
            success: true,
            message: `Carpeta renombrada de ${nombreCarpetaAnterior} a ${nombreCarpetaNuevo}`
        };
    } catch (error) {
        console.error("Error al renombrar carpeta:", error);
        return {
            success: false,
            message: `Error al renombrar carpeta: ${
                error instanceof Error ? error.message : String(error)
            }`
        };
    }
}

// Eliminar carpeta por nombreCarpeta generado
export async function eliminarCarpeta(nombreCarpeta: string): Promise<{ success: boolean; message: string }> {
    try {
        const rutaCarpeta = getRutaEnRaiz(`uploads/${nombreCarpeta}`);

        // Verificar si la carpeta existe
        try {
            await Deno.stat(rutaCarpeta);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return { success: true, message: "La carpeta no existe o el nombre es errado" };
            }
            throw error;
        }

        // Eliminar la carpeta y su contenido
        await Deno.remove(rutaCarpeta, { recursive: true });
        return { success: true, message: `Carpeta ${nombreCarpeta} eliminada exitosamente` };
    } catch (error) {
        return { 
            success: false, 
            message: `Error al intentar eliminar la carpeta: ${
                error instanceof Error ? error.message : String(error)
            }` 
        };
    }
}