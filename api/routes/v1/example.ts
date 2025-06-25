import { libx } from "libx.js/build/bundles/essentials";
import { IRequest, Router, json, text } from "itty-router";
// import { DI } from "edge.libx.js/src/modules/di";
import { RouterWrapper, cors } from "edge.libx.js";

export default (base: string) => {
	const router = Router({ base });

	router.all('/x', (req, env, ctx) => {
		return cors.default(
			req,
			new Response(JSON.stringify({ message: 'Hello World!' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
			{
				origin: '*',
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
				exposedHeaders: ['Content-Type', 'Authorization'],
				credentials: true,
			}
		)
		return text(base);
	});

	router.get('/:key?', async (req: IRequest, env, ctx) => {
		return json(`ok - ${req.params.key}`);
	});


	return { base, router };
};