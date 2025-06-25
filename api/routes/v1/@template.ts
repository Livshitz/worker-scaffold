import { IRequest, IttyRouter, Router, error, json, text, withParams } from 'itty-router'
import { libx } from "libx.js/build/bundles/essentials";
// import { di } from "libx.js/build/modules/dependencyInjector";

export default (base: string) => {
	const router = Router({ base });

	router.get('/:key', async (req: IRequest, env, ctx) => {
		return json(`ok - ${req.params.key}`);
	});

	return { base, router };
};