import { serverAdapter, baseRouterWrapper } from '../@worker.js';

export const prefix = ''; // important for debug

export default serverAdapter.handle;
export const router = baseRouterWrapper.router;
export const server = serverAdapter;
export const handler = serverAdapter.handle;
