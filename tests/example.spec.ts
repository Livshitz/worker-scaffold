import createExampleRouter from '../api/routes/v1/example';

describe('example router', () => {
	const { router } = createExampleRouter('/test');

	it('should return JSON with key on GET /:key?', async () => {
		const req = new Request('http://localhost/test/abc', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.headers.get('Content-Type')).toMatch(/^application\/json/);
		const json = await res.json();
		expect(json).toBe('ok - abc');
	});

	it('should return JSON with key on GET /', async () => {
		const req = new Request('http://localhost/test/', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.headers.get('Content-Type')).toMatch(/^application\/json/);
		const json = await res.json();
		expect(json).toBe('ok - undefined');
	});

	const methods = ['GET', 'POST', 'PUT', 'DELETE'];
	for (const method of methods) {
		it(`should return CORS JSON on ${method} /x`, async () => {
			const req = new Request('http://localhost/test/x', { method });
			let res = await router.fetch(req);
			if (!(res instanceof Response)) {
				res = new Response(res);
			}
			expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(res.headers.get('Content-Type')).toMatch(/^application\/json/);
			const body = await res.text();
			expect(body).toBe('{"message":"Hello World!"}');
		});
	}

	it('should return CORS headers on OPTIONS /x', async () => {
		const req = new Request('http://localhost/test/x', { method: 'OPTIONS' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type,Authorization');
		expect(res.headers.get('Access-Control-Expose-Headers')).toBe('Content-Type,Authorization');
		expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
		expect(res.headers.get('Content-Type')).toMatch(/^application\/json/);
		const body = await res.text();
		expect(body).toBe('');
	});
}); 