# 🏗 worker-scaffold

A modern scaffold for building new **worker edge web services** with TypeScript, Bun, and itty-router. This project provides a ready-to-use structure for rapid development and testing of edge-compatible APIs, with best practices for routing, CORS, and testing out of the box.

## Features

- ⚡️ **Edge-ready**: Designed for Cloudflare Workers, Vercel Edge, and other edge runtimes
- 🛣 **Route scaffolding**: Easily add new API routes with modular structure under `api/routes/v1/`
- 🧪 **Jest/Bun testing**: Pre-configured for Bun and Jest, with example tests for all route types
- 🌐 **CORS & JSON helpers**: Built-in CORS and JSON response utilities for modern APIs
- 🏗 **Opinionated TypeScript config**: ES6+ target, strict mode, and edge-friendly settings
- 🛠 **VSCode debug settings**: Debug your worker code and tests with pre-made launch configs
- 📦 **Ready for CI/CD**: Easily integrate with GitHub Actions for test and deploy workflows

## Quick Start

### Scaffolding a New Worker

You can scaffold a new worker project using the built-in CLI.

1. Run interactive Create script with Bun or npx:

    ```sh
    bunx https://github.com/Livshitz/worker-scaffold
    ```

    Or pass arguments for non-interactive scaffolding:

    #### CLI Options:
    - `--yes` / `-y`: Non-interactive mode (no prompts)
    - `--name` / `-n`: Name of the worker (used in config files)
    - `--dir` / `-d`: Target directory to initialize the worker in (default: current directory)
    - `--provider` / `-p`: Provider to scaffold for (`cloudflare`, `vercel`, or `both`)

        ##### Example:
        ```sh
        # Scaffold in current directory, set worker name
        bunx https://github.com/Livshitz/worker-scaffold --yes --name=my-worker --provider=cloudflare
        # Scaffold in a custom directory
        bunx https://github.com/Livshitz/worker-scaffold --yes --dir=./my-worker-folder --name=my-worker --provider=cloudflare
        ```

<!-- 
1. **Create this scaffold:**

   $ git clone --depth=1 git@github.com:Livshitz/worker-scaffold.git worker-scaffold-temp && rm -rf worker-scaffold-temp/.git
$ mv worker-scaffold-temp <new folder name> 
-->

2. **Install dependencies:**

   ```sh
   cd new-worker
   bun install
   ```

3. **Run tests:**

   ```sh
   bun test
   ```

4. **Develop your API:**
   - Add new routes in `api/routes/v1/`
   - Add or update tests in `tests/`

5. **Build & deploy:**
   - Use your preferred edge platform (Cloudflare, Vercel, etc.)


## Example: Adding a Route

Check the template example in `api/v1/@template`.  

Create a new file in `api/routes/v1/`.

## Directory Structure

- `api/routes/v1/` — Your edge API route modules
- `tests/` — Jest/Bun test files for your routes

## CI/CD:
- **Cloudflare**: 
  - option 1: Gti integration - follow this [guide](https://developers.cloudflare.com/workers/ci-cd/builds/)
  - option 2: Github Actions - set up auth API token and set the env secrets for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.  
  Follow this [guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
  
- **Vercel**:  
    - connect your repo to Vercel project, it'll handle the CI/CD.  
    Guide: https://vercel.com/docs/git/vercel-for-github

## Scaffolded With

[🏗 worker-scaffold](https://github.com/Livshitz/worker-scaffold)

## Initializing in an Existing Project (Merge Mode)

You can initialize the worker scaffold in an existing project using the `--merge` flag (optionally with `--dir`):

```sh
bunx https://github.com/Livshitz/worker-scaffold --merge --dir=./existing-folder
```

- The CLI will copy new files and, for files/folders listed in the `merge` file, if a file already exists and differs, it will:
  - Leave your file untouched.
  - Save the scaffold version as `filename.scaffold` (e.g., `package.json.scaffold`).
  - Print a list of files that require manual merging.
- **Provider selection is respected in merge mode:**
  - After merging, only the relevant adapters and config files for your chosen provider (`cloudflare`, `vercel`, or `both`) are kept. Irrelevant files are removed automatically.

**You should manually review and merge the `.scaffold` files as needed.**

##### Example output:
```
The following files require manual merging:
  - package.json
  - wrangler.toml
  - vercel.json
Scaffold versions have been saved as .scaffold files.
```
