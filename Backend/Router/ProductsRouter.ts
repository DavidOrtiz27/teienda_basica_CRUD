import { Router } from "../Dependencies/Dependendcies.ts";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../Controller/ProductsController.ts";

const ProductsRouter = new Router();

ProductsRouter.get("/", getProducts);
ProductsRouter.post("/products", createProduct);
ProductsRouter.put("/products", updateProduct);
ProductsRouter.delete("/products/:id", deleteProduct);

export { ProductsRouter };