// import { libx } from "libx.js/build/bundles/essentials";
import { IRequest, Router, json, text } from "itty-router";
import { RouterWrapper, cors } from "edge.libx.js";
import routesBasic from "./basic.js";
import routesAR from "./auto-router.js";
import routesCloudflare from "./cloudflare.js";

export default (base: string) => {
	const router = Router({ base });

	const routerWrapper = RouterWrapper.getNew(base);
	routerWrapper.registerRoute(`/test-basic`, routesBasic);
	routerWrapper.registerRoute(`/test-ar`, (base: string) => {
		return { base, router: routesAR };
	});
	routerWrapper.registerRoute(`/test-cloudflare`, (base: string) => {
		return { base, router: routesCloudflare };
	});

	routerWrapper.router.all('/x', (req, env, ctx) => {
		return cors.default(
			req,
			json({ message: 'Hello World!' })
			// new Response(JSON.stringify({ message: 'Hello World!' }), {
			// 	status: 200,
			// 	headers: { 'Content-Type': 'application/json' },
			// })
		)
		return text(routerWrapper.base);
	});

	return { base, router: routerWrapper.router };
};