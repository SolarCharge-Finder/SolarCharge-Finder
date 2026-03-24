import { fail } from '../src/utils/responseHelper.js';

export default function errorHandler(err, _req, res, _next) {
  // you can extend to log errors differently depending on env
  const status = err.status || 500;
  const message = err.message || 'Server Error';
  return fail(res, { message, status });
}
