#!/usr/bin/env bun

import { existsSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import prompts from 'prompts';
import minimist from 'minimist';
import { execSync } from 'child_process';

const argv = minimist(process.argv.slice(2));
const yesMode = argv.yes || argv.y;
const argWorkerName = argv.name || argv.n;
const argProvider = argv.provider || argv.p;

(async () => {
	let workerName = argWorkerName || 'new-worker';
	let provider = argProvider || 'cloudflare';

	if (!yesMode) {
		const response = await prompts([
			{
				type: 'text',
				name: 'workerName',
				message: 'Worker name:',
				initial: workerName,
			},
			{
				type: 'select',
				name: 'provider',
				message: 'Choose provider:',
				choices: [
					{ title: 'Cloudflare', value: 'cloudflare' },
					{ title: 'Vercel', value: 'vercel' },
					{ title: 'Both', value: 'both' },
				],
				initial: provider === 'vercel' ? 1 : provider === 'both' ? 2 : 0,
			},
		]);
		workerName = response.workerName;
		provider = response.provider;
	}

	const targetDir = resolve(process.cwd(), workerName);
	if (existsSync(targetDir)) {
		console.error(`Directory '${workerName}' already exists.`);
		process.exit(1);
	}

	// 1. Clone the template repo
	const repoUrl = 'https://github.com/Livshitz/worker-scaffold.git';
	execSync(`git clone --depth=1 ${repoUrl} ${workerName}`, { stdio: 'inherit' });

	// 2. Remove .git to allow new repo
	rmSync(join(targetDir, '.git'), { recursive: true, force: true });

	// 3. Remove irrelevant adapters/configs
	const adaptersPath = join(targetDir, 'api', 'adapters');
	if (provider === 'cloudflare') {
		for (const file of readdirSync(adaptersPath)) {
			if (!['cloudflare.ts', 'debug.ts'].includes(file)) {
				rmSync(join(adaptersPath, file));
			}
		}
		rmSync(join(targetDir, 'vercel.json'));
	} else if (provider === 'vercel') {
		for (const file of readdirSync(adaptersPath)) {
			if (!['vercel.ts', 'debug.ts'].includes(file)) {
				rmSync(join(adaptersPath, file));
			}
		}
		rmSync(join(targetDir, 'wrangler.toml'));
	}

	// 4. Update package.json name
	const pkgPath = join(targetDir, 'package.json');
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
	pkg.name = workerName;
	writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

	// 5. Update wrangler.toml name if present
	const wranglerPath = join(targetDir, 'wrangler.toml');
	if (existsSync(wranglerPath)) {
		let wrangler = readFileSync(wranglerPath, 'utf8');
		wrangler = wrangler.replace(/^name\s*=\s*"[^"]*"/m, `name = "${workerName}"`);
		writeFileSync(wranglerPath, wrangler);
	}

	// 6. Update README.md title and keep CI/CD instructions
	const readmePath = join(targetDir, 'README.md');
	if (existsSync(readmePath)) {
		let readme = readFileSync(readmePath, 'utf8');
		readme = readme.replace(/^# .*/m, `# ${workerName}`);
		writeFileSync(readmePath, readme);
	}
})();

// TODO: Support --yes flag for non-interactive mode
// To support npx/bunx/npm create, ensure package.json has a bin entry for this script. 