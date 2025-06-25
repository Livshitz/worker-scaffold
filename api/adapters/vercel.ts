import { serverAdapter, baseRouterWrapper } from '../@worker.js';

export const config = {
	runtime: 'edge',
};

export default serverAdapter.handle; // vercel
export const router = baseRouterWrapper.router;
export const server = serverAdapter;
export const handle = serverAdapter.handle;
