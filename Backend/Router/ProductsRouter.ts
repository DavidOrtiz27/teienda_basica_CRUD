import { Router } from "../Dependencies/Dependendcies.ts";
import { getProducts,getProductByID ,createProduct, updateProduct, deleteProduct, postUploadFromXLSX } from "../Controller/ProductsController.ts";

const ProductsRouter = new Router();

ProductsRouter.get("/products", getProducts);
ProductsRouter.get("/products/:id", getProductByID);
ProductsRouter.post("/products", createProduct);
ProductsRouter.put("/products", updateProduct);
ProductsRouter.delete("/products/:id", deleteProduct);
ProductsRouter.post("/upload", postUploadFromXLSX);
export { ProductsRouter };