import { serverAdapter, baseRouterWrapper } from '../@worker';

export default {
	fetch: serverAdapter.fetch,
}
