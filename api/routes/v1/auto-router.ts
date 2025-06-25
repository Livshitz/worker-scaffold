// works. ref: https://itty.dev/itty-router/guides/cloudflare-workers
import { AutoRouter } from 'itty-router'

const router = AutoRouter()

router.get('/*', () => 'Success! auto-router');

export default router // see note below