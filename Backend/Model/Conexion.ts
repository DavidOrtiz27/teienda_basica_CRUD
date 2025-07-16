import { Client } from "../Dependencies/Dependendcies.ts";

const Conexion = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "",
  db: "tienda_ropa",
  port: 3306,
});


export default Conexion;
