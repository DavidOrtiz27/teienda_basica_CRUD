import { Application, oakCors } from "./Dependencies/Dependendcies.ts";
import { ProductsRouter } from "./Router/ProductsRouter.ts";
const app = new Application();
app.use(oakCors());



app.use(async (ctx, next) => {
    if (ctx.request.url.pathname.startsWith("/uploads")) {
      await send(ctx, ctx.request.url.pathname, {
        root: Deno.cwd(), // o la ruta absoluta a tu proyecto
      });
    } else {
      await next();
    }
  });

const routes = [ProductsRouter];
routes.forEach((router) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
});

console.log("Server is running on http://localhost:8000");
await app.listen({ port: 8000 });
