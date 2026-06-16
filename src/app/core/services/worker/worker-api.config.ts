import { environment } from '../../../../environments/environment';

/** Base API URL without trailing slash. */
export const WORKER_API_BASE = environment.apiUrl.replace(/\/$/, '');
