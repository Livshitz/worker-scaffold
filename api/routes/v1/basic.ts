// import { Router, json, error, cors } from 'itty-router'
import { IRequest, IttyRouter, Router, error, json, text, withParams } from 'itty-router'
import { RouterWrapper, cors } from "edge.libx.js";

export default (base: string) => {
	const router = Router({ base });

	router.get('/', () => 'Success! basic');

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

	return { base, router };
};