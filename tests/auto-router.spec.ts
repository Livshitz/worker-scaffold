import router from '../api/routes/v1/auto-router';

describe('auto-router', () => {
	it('should return success string on GET /*', async () => {
		const req = new Request('http://localhost/anything', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		const text = await res.text();
		expect(text).toBe('"Success! auto-router"');
	});
}); 