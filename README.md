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

1. **Clone this scaffold:**

   ```sh
   $ git clone --depth=1 git@github.com:Livshitz/worker-scaffold.git worker-scaffold-temp && rm -rf worker-scaffold-temp/.git
   $ mv worker-scaffold-temp <new folder name>
   ```

2. **Install dependencies:**

   ```sh
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
