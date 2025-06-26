import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TEST_DIR = '.tmp/test/unit-test-worker';

describe('create-worker CLI', () => {
	afterAll(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	it('should scaffold a new worker with only cloudflare/debug adapters and no .git', () => {
		execSync(`bunx tsx bin/create-worker.ts --yes --name=${TEST_DIR} --provider=cloudflare`, { stdio: 'inherit' });
		expect(existsSync(TEST_DIR)).toBe(true);
		expect(existsSync(join(TEST_DIR, '.git'))).toBe(false);
		const adapters = readdirSync(join(TEST_DIR, 'api', 'adapters'));
		expect(adapters.sort()).toEqual(['cloudflare.ts', 'debug.ts'].sort());
	});
}); 