import createBasicRouter from '../api/routes/v1/basic';

describe('basic router', () => {
	const { router } = createBasicRouter('/test');

	it("should return 'Success! basic' on GET /", async () => {
		const req = new Request('http://localhost/test/', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		const text = await res.text();
		expect(text).toBe('Success! basic');
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
			expect(res.headers.get('Access-Control-Expose-Headers')).toBe('Content-Type,Authorization');
			expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
			expect(res.headers.get('Content-Type')).toBe('application/json');
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
		expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT,DELETE,OPTIONS');
		expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type,Authorization');
		expect(res.headers.get('Access-Control-Expose-Headers')).toBe('Content-Type,Authorization');
		expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
		expect(res.headers.get('Content-Type')).toBe('application/json');
		const body = await res.text();
		expect(body).toBe('');
	});

	it('should return 200 and empty body for unknown route', async () => {
		const req = new Request('http://localhost/test/unknown', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).toBe('');
	});
}); 