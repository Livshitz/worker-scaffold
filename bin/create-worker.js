#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const prompts_1 = __importDefault(require("prompts"));
const minimist_1 = __importDefault(require("minimist"));
const child_process_1 = require("child_process");
const minimatch_1 = require("minimatch");
const argv = (0, minimist_1.default)(process.argv.slice(2));
const yesMode = argv.yes || argv.y;
const mergeMode = argv.merge || false;
const argWorkerName = argv.name || argv.n;
const argTargetDir = argv.dir || argv.d;
const argProvider = argv.provider || argv.p;
(async () => {
    let workerName = argWorkerName || 'new-worker';
    let provider = argProvider || 'cloudflare';
    let targetDir = argTargetDir ? (0, path_1.resolve)(argTargetDir) : process.cwd();
    if (!yesMode) {
        const response = await (0, prompts_1.default)([
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
        targetDir = (0, path_1.resolve)(response.targetDir);
        provider = response.provider;
    }
    console.log(`\n[worker-scaffold] Initializing worker project in: '${targetDir}' (name: ${workerName}, provider: ${provider}${mergeMode ? ', merge mode' : ''})`);
    if ((0, fs_1.existsSync)(targetDir) && (0, fs_1.readdirSync)(targetDir).length > 0 && !mergeMode) {
        console.error(`Directory '${targetDir}' already exists and is not empty. Use --merge to merge scaffold into existing project.`);
        process.exit(1);
    }
    if (mergeMode) {
        console.log('[worker-scaffold] Merge mode enabled: only files matching patterns in the merge file will be processed.');
    }
    // 1. Clone the template repo to temp
    console.log('[worker-scaffold] Cloning template repository...');
    const repoUrl = 'https://github.com/Livshitz/worker-scaffold.git';
    const tempDir = (0, path_1.join)(process.cwd(), `.tmp/scaffold-tmp-${Date.now()}`);
    (0, child_process_1.execSync)(`git clone --depth=1 ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
    // 2. Remove .git from temp
    console.log('[worker-scaffold] Removing .git directory from template...');
    (0, fs_1.rmSync)((0, path_1.join)(tempDir, '.git'), { recursive: true, force: true });
    // 3. Read merge globs
    let mergeGlobs = [];
    const mergeFile = (0, path_1.join)(tempDir, 'merge');
    if ((0, fs_1.existsSync)(mergeFile)) {
        mergeGlobs = (0, fs_1.readFileSync)(mergeFile, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (mergeMode) {
            console.log(`[worker-scaffold] Merge patterns loaded: ${mergeGlobs.join(', ')}`);
        }
    }
    const mergeConflicts = [];
    function shouldMerge(relPath) {
        // Normalize to remove leading './' or '/' but preserve dots in filenames
        const norm = relPath.replace(/^\.\//, '').replace(/^\//, '');
        return mergeGlobs.some(pattern => (0, minimatch_1.minimatch)(norm, pattern));
    }
    // 4. Copy or merge files from temp to target
    function copyOrMerge(src, dest, relPath) {
        const stat = (0, fs_1.statSync)(src);
        if (stat.isDirectory()) {
            // For directories, check if the dir itself or its contents should be merged
            const dirShouldMerge = shouldMerge(relPath) || shouldMerge(relPath + '/') || shouldMerge(relPath + '/**');
            if (mergeMode && !dirShouldMerge)
                return;
            if (!(0, fs_1.existsSync)(dest)) {
                (0, fs_1.mkdirSync)(dest, { recursive: true });
            }
            for (const file of (0, fs_1.readdirSync)(src)) {
                copyOrMerge((0, path_1.join)(src, file), (0, path_1.join)(dest, file), (0, path_1.join)(relPath, file));
            }
        }
        else {
            // For files, check if they should be merged
            const fileShouldMerge = shouldMerge(relPath);
            if (mergeMode && !fileShouldMerge)
                return;
            const mergeNeeded = shouldMerge(relPath);
            if (!(0, fs_1.existsSync)(dest)) {
                // Ensure parent directory exists
                const parentDir = require('path').dirname(dest);
                if (!(0, fs_1.existsSync)(parentDir)) {
                    (0, fs_1.mkdirSync)(parentDir, { recursive: true });
                }
                (0, fs_1.copyFileSync)(src, dest);
                if (mergeMode)
                    console.log(`[worker-scaffold] Copied: ${relPath}`);
            }
            else if (mergeNeeded) {
                const existing = (0, fs_1.readFileSync)(dest, 'utf8');
                const scaffold = (0, fs_1.readFileSync)(src, 'utf8');
                if (existing !== scaffold) {
                    mergeConflicts.push(relPath);
                    (0, fs_1.writeFileSync)(dest + '.scaffold', scaffold, 'utf8');
                    console.log(`[worker-scaffold] Merge conflict: ${relPath} (scaffold version saved as .scaffold)`);
                }
            }
        }
    }
    function copyDir(src, dest) {
        // Ensure target directory exists
        if (!(0, fs_1.existsSync)(dest)) {
            (0, fs_1.mkdirSync)(dest, { recursive: true });
        }
        for (const file of (0, fs_1.readdirSync)(src)) {
            const srcPath = (0, path_1.join)(src, file);
            const destPath = (0, path_1.join)(dest, file);
            const relPath = pathRelative(tempDir, srcPath);
            copyOrMerge(srcPath, destPath, relPath);
        }
    }
    function pathRelative(base, file) {
        return file.replace(base + '/', '').replace(base, '');
    }
    copyDir(tempDir, targetDir);
    // 5. Remove temp dir
    console.log('[worker-scaffold] Cleaning up temporary files...');
    (0, fs_1.rmSync)(tempDir, { recursive: true, force: true });
    // 6. Print merge report
    if (mergeMode && mergeConflicts.length) {
        console.log('\n[worker-scaffold] The following files require manual merging:');
        mergeConflicts.forEach(f => console.log('  -', f));
        console.log('[worker-scaffold] Scaffold versions have been saved as .scaffold files.');
    }
    // 7. Provider-specific cleanup and config updates (always run, both modes)
    console.log(`[worker-scaffold] Cleaning up adapters and config files for provider: ${provider}...`);
    const adaptersPath = (0, path_1.join)(targetDir, 'api', 'adapters');
    if ((0, fs_1.existsSync)(adaptersPath)) {
        if (provider === 'cloudflare') {
            for (const file of (0, fs_1.readdirSync)(adaptersPath)) {
                if (!['cloudflare.ts', 'debug.ts'].includes(file)) {
                    (0, fs_1.rmSync)((0, path_1.join)(adaptersPath, file));
                    console.log(`[worker-scaffold] Removed adapter: api/adapters/${file}`);
                }
            }
            const vercelJson = (0, path_1.join)(targetDir, 'vercel.json');
            if ((0, fs_1.existsSync)(vercelJson)) {
                (0, fs_1.rmSync)(vercelJson);
                console.log('[worker-scaffold] Removed: vercel.json');
            }
        }
        else if (provider === 'vercel') {
            for (const file of (0, fs_1.readdirSync)(adaptersPath)) {
                if (!['vercel.ts', 'debug.ts'].includes(file)) {
                    (0, fs_1.rmSync)((0, path_1.join)(adaptersPath, file));
                    console.log(`[worker-scaffold] Removed adapter: api/adapters/${file}`);
                }
            }
            const wranglerToml = (0, path_1.join)(targetDir, 'wrangler.toml');
            if ((0, fs_1.existsSync)(wranglerToml)) {
                (0, fs_1.rmSync)(wranglerToml);
                console.log('[worker-scaffold] Removed: wrangler.toml');
            }
        }
    }
    console.log(`\n[worker-scaffold] Worker project '${workerName}' is ready!`);
    // 4. Update package.json name
    const pkgPath = (0, path_1.join)(targetDir, 'package.json');
    if ((0, fs_1.existsSync)(pkgPath)) {
        const pkg = JSON.parse((0, fs_1.readFileSync)(pkgPath, 'utf8'));
        pkg.name = workerName;
        (0, fs_1.writeFileSync)(pkgPath, JSON.stringify(pkg, null, 2));
    }
    // 5. Update wrangler.toml name if present
    const wranglerPath = (0, path_1.join)(targetDir, 'wrangler.toml');
    if ((0, fs_1.existsSync)(wranglerPath)) {
        let wrangler = (0, fs_1.readFileSync)(wranglerPath, 'utf8');
        wrangler = wrangler.replace(/^name\s*=\s*"[^"]*"/m, `name = "${workerName}"`);
        (0, fs_1.writeFileSync)(wranglerPath, wrangler);
    }
    // 6. Update README.md title and keep CI/CD instructions
    const readmePath = (0, path_1.join)(targetDir, 'README.md');
    if ((0, fs_1.existsSync)(readmePath)) {
        let readme = (0, fs_1.readFileSync)(readmePath, 'utf8');
        readme = readme.replace(/^# .*/m, `# ${workerName}`);
        (0, fs_1.writeFileSync)(readmePath, readme);
    }
})();
// TODO: Support --yes flag for non-interactive mode
// To support npx/bunx/npm create, ensure package.json has a bin entry for this script. 
