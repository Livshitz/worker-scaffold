import { existsSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TEST_DIR = '.tmp/test/unit-test-worker';
const MERGE_TEST_DIR = '.tmp/merge-test-worker';
const MERGE_FILE = 'merge';

describe('create-worker CLI', () => {
	afterAll(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
		if (existsSync(MERGE_TEST_DIR)) {
			rmSync(MERGE_TEST_DIR, { recursive: true, force: true });
		}
	});

	it('should scaffold a new worker with only cloudflare/debug adapters and no .git', () => {
		execSync(`bunx tsx bin/create-worker.ts --yes --name=${TEST_DIR} --provider=cloudflare`, { stdio: 'inherit' });
		expect(existsSync(TEST_DIR)).toBe(true);
		expect(existsSync(join(TEST_DIR, '.git'))).toBe(false);
		const adapters = readdirSync(join(TEST_DIR, 'api', 'adapters'));
		expect(adapters.sort()).toEqual(['cloudflare.ts', 'debug.ts'].sort());
	});

	it('should only merge/copy files listed in merge file when --merge is used', () => {
		// Setup: create a non-empty target dir with a custom file and package.json
		rmSync(MERGE_TEST_DIR, { recursive: true, force: true });
		// Ensure target dir exists
		require('fs').mkdirSync(MERGE_TEST_DIR, { recursive: true });
		writeFileSync(join(MERGE_TEST_DIR, 'custom.txt'), 'custom content');
		writeFileSync(join(MERGE_TEST_DIR, 'package.json'), '{"name":"existing-project"}');
		// Run merge
		execSync(`bunx tsx bin/create-worker.ts --merge --yes --name=${MERGE_TEST_DIR} --provider=cloudflare`, { stdio: 'inherit' });
		// vercel.json should exist (copied from scaffold)
		expect(existsSync(join(MERGE_TEST_DIR, 'vercel.json'))).toBe(true);
		// custom.txt should remain untouched
		expect(readFileSync(join(MERGE_TEST_DIR, 'custom.txt'), 'utf8')).toBe('custom content');
		// api/ should exist (copied from scaffold)
		expect(existsSync(join(MERGE_TEST_DIR, 'api'))).toBe(true);
		// package.json.scaffold should exist (merge conflict)
		expect(existsSync(join(MERGE_TEST_DIR, 'package.json.scaffold'))).toBe(true);
	});
}); 