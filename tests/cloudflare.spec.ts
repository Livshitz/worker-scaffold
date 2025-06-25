import router from '../api/routes/v1/cloudflare';

describe('cloudflare router', () => {
	it('should return JSON on GET /*', async () => {
		const req = new Request('http://localhost/anything', { method: 'GET' });
		let res = await router.fetch(req);
		if (!(res instanceof Response)) {
			res = new Response(res);
		}
		expect(res.headers.get('Content-Type')).toBe('application/json');
		const json = await res.json();
		expect(json).toEqual({ message: 'ok 4' });
	});
}); 