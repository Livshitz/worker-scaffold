import createTemplateRouter from '../api/routes/v1/@template';

describe('template router', () => {
	const { router } = createTemplateRouter('/test');

	it('should return JSON ok on GET /:key', async () => {
		const req = new Request('http://localhost/test/abc', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.headers.get('Content-Type')).toMatch(/^application\/json/);
		const json = await res.json();
		expect(json).toBe('ok - abc');
	});
}); 