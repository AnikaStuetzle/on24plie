import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import authRouter from "./routes/auth.ts";

const app = new Application();

app.use(oakCors());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use((ctx) => {
	ctx.response.status = 404;
	ctx.response.body = "Not Found";
});

await app.listen({ port: 8010 });
