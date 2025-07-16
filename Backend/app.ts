import { Application, oakCors } from "./Dependencies/Dependendcies.ts";
import { ProductsRouter } from "./Router/ProductsRouter.ts";
const app = new Application();
app.use(oakCors());

const routes = [ProductsRouter];
routes.forEach((router) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
});

console.log("Server is running on http://localhost:8000");
await app.listen({ port: 8000 });
