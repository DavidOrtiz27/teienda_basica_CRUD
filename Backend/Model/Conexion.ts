// @ts-ignore
// Deno es global en el entorno de ejecución de Deno
import { Client } from "../Dependencies/Dependendcies.ts";

// @ts-ignore
const Conexion = await new Client().connect({
  hostname: Deno.env.get("MYSQL_HOST") || "localhost",
  username: Deno.env.get("MYSQL_USER") || "root",
  password: Deno.env.get("MYSQL_PASSWORD") || "",
  db: Deno.env.get("MYSQL_DB") || "tienda_ropa",
  port: 3306,
});

export default Conexion;
