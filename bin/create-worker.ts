#!/usr/bin/env bun

import { existsSync, readdirSync, rmSync, readFileSync, writeFileSync, statSync, copyFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import prompts from 'prompts';
import minimist from 'minimist';
import { execSync } from 'child_process';
import { minimatch } from 'minimatch';

const argv = minimist(process.argv.slice(2));
const yesMode = argv.yes || argv.y;
const mergeMode = argv.merge || false;
const argWorkerName = argv.name || argv.n;
const argTargetDir = argv.dir || argv.d;
const argProvider = argv.provider || argv.p;

(async () => {
	let workerName = argWorkerName || 'new-worker';
	let provider = argProvider || 'cloudflare';
	let targetDir = argTargetDir ? resolve(argTargetDir) : process.cwd();

	if (!yesMode) {
		const response = await prompts([
			{
				type: 'text',
				name: 'workerName',
				message: 'Worker name:',
				initial: workerName,
			},
			{
				type: 'text',
				name: 'targetDir',
				message: 'Target directory:',
				initial: targetDir,
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
		targetDir = resolve(response.targetDir);
		provider = response.provider;
	}

	console.log(`\n[worker-scaffold] Initializing worker project in: '${targetDir}' (name: ${workerName}, provider: ${provider}${mergeMode ? ', merge mode' : ''})`);

	if (existsSync(targetDir) && readdirSync(targetDir).length > 0 && !mergeMode) {
		console.error(`Directory '${targetDir}' already exists and is not empty. Use --merge to merge scaffold into existing project.`);
		process.exit(1);
	}

	if (mergeMode) {
		console.log('[worker-scaffold] Merge mode enabled: only files matching patterns in the merge file will be processed.');
	}

	// 1. Clone the template repo to temp
	console.log('[worker-scaffold] Cloning template repository...');
	const repoUrl = 'https://github.com/Livshitz/worker-scaffold.git';
	const tempDir = join(process.cwd(), `.tmp/scaffold-tmp-${Date.now()}`);
	execSync(`git clone --depth=1 ${repoUrl} ${tempDir}`, { stdio: 'inherit' });

	// 2. Remove .git from temp
	console.log('[worker-scaffold] Removing .git directory from template...');
	rmSync(join(tempDir, '.git'), { recursive: true, force: true });

	// 3. Read merge globs
	let mergeGlobs: string[] = [];
	const mergeFile = join(tempDir, 'merge');
	if (existsSync(mergeFile)) {
		mergeGlobs = readFileSync(mergeFile, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
		if (mergeMode) {
			console.log(`[worker-scaffold] Merge patterns loaded: ${mergeGlobs.join(', ')}`);
		}
	}

	const mergeConflicts: string[] = [];
	function shouldMerge(relPath: string) {
		// Normalize to remove leading './' or '/' but preserve dots in filenames
		const norm = relPath.replace(/^\.\//, '').replace(/^\//, '');
		return mergeGlobs.some(pattern => minimatch(norm, pattern));
	}

	// 4. Copy or merge files from temp to target
	function copyOrMerge(src: string, dest: string, relPath: string) {
		const stat = statSync(src);
		if (stat.isDirectory()) {
			// For directories, check if the dir itself or its contents should be merged
			const dirShouldMerge = shouldMerge(relPath) || shouldMerge(relPath + '/') || shouldMerge(relPath + '/**');
			if (mergeMode && !dirShouldMerge) return;
			if (!existsSync(dest)) {
				mkdirSync(dest, { recursive: true });
			}
			for (const file of readdirSync(src)) {
				copyOrMerge(join(src, file), join(dest, file), join(relPath, file));
			}
		} else {
			// For files, check if they should be merged
			const fileShouldMerge = shouldMerge(relPath);
			if (mergeMode && !fileShouldMerge) return;
			const mergeNeeded = shouldMerge(relPath);
			if (!existsSync(dest)) {
				// Ensure parent directory exists
				const parentDir = require('path').dirname(dest);
				if (!existsSync(parentDir)) {
					mkdirSync(parentDir, { recursive: true });
				}
				copyFileSync(src, dest);
				if (mergeMode) console.log(`[worker-scaffold] Copied: ${relPath}`);
			} else if (mergeNeeded) {
				const existing = readFileSync(dest, 'utf8');
				const scaffold = readFileSync(src, 'utf8');
				if (existing !== scaffold) {
					mergeConflicts.push(relPath);
					writeFileSync(dest + '.scaffold', scaffold, 'utf8');
					console.log(`[worker-scaffold] Merge conflict: ${relPath} (scaffold version saved as .scaffold)`);
				}
			}
		}
	}

	function copyDir(src: string, dest: string) {
		// Ensure target directory exists
		if (!existsSync(dest)) {
			mkdirSync(dest, { recursive: true });
		}
		for (const file of readdirSync(src)) {
			const srcPath = join(src, file);
			const destPath = join(dest, file);
			const relPath = pathRelative(tempDir, srcPath);
			copyOrMerge(srcPath, destPath, relPath);
		}
	}

	function pathRelative(base: string, file: string) {
		return file.replace(base + '/', '').replace(base, '');
	}

	copyDir(tempDir, targetDir);

	// 5. Remove temp dir
	console.log('[worker-scaffold] Cleaning up temporary files...');
	rmSync(tempDir, { recursive: true, force: true });

	// 6. Print merge report
	if (mergeMode && mergeConflicts.length) {
		console.log('\n[worker-scaffold] The following files require manual merging:');
		mergeConflicts.forEach(f => console.log('  -', f));
		console.log('[worker-scaffold] Scaffold versions have been saved as .scaffold files.');
	}

	// 7. Provider-specific cleanup and config updates (always run, both modes)
	console.log(`[worker-scaffold] Cleaning up adapters and config files for provider: ${provider}...`);
	const adaptersPath = join(targetDir, 'api', 'adapters');
	if (existsSync(adaptersPath)) {
		if (provider === 'cloudflare') {
			for (const file of readdirSync(adaptersPath)) {
				if (!['cloudflare.ts', 'debug.ts'].includes(file)) {
					rmSync(join(adaptersPath, file));
					console.log(`[worker-scaffold] Removed adapter: api/adapters/${file}`);
				}
			}
			const vercelJson = join(targetDir, 'vercel.json');
			if (existsSync(vercelJson)) {
				rmSync(vercelJson);
				console.log('[worker-scaffold] Removed: vercel.json');
			}
		} else if (provider === 'vercel') {
			for (const file of readdirSync(adaptersPath)) {
				if (!['vercel.ts', 'debug.ts'].includes(file)) {
					rmSync(join(adaptersPath, file));
					console.log(`[worker-scaffold] Removed adapter: api/adapters/${file}`);
				}
			}
			const wranglerToml = join(targetDir, 'wrangler.toml');
			if (existsSync(wranglerToml)) {
				rmSync(wranglerToml);
				console.log('[worker-scaffold] Removed: wrangler.toml');
			}
		}
	}

	console.log(`\n[worker-scaffold] Worker project '${workerName}' is ready!`);

	// 4. Update package.json name
	const pkgPath = join(targetDir, 'package.json');
	if (existsSync(pkgPath)) {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
		pkg.name = workerName;
		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
	}

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