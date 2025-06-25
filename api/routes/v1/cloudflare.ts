import {
	Router,
	IRequest,
	json,
} from 'itty-router'

// we define our environment
type Environment = {
	// KV: KVNamespace
};

// and now both args combined (that Workers send to the .fetch())
type CFArgs = [Environment,]; // ExecutionContext] 

// then just pass it to the router
const router = Router<IRequest, CFArgs>()

router.get('/*', (request, env, ctx) => {
	// env.KV.get('test') // this works!
	// ctx.waitUntil() // so does this!	
	console.log('dbg:', {
		request: request,
		env: env,
		ctx: ctx,
	});
	return new Response(JSON.stringify({
		message: 'ok 4',
	}), {
		headers: {
			'Content-Type': 'application/json',
		},
	})
})

export default router;