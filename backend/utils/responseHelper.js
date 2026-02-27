/**
 * @typedef {Object} ResponseOptions
 * @property {any} [data]
 * @property {string} [message]
 * @property {number} [status]
 * @property {number} [count]
 * @property {any} [errors]
 */

/**
 * Send a successful JSON response with a consistent envelope
 * @param {import('express').Response} res
 * @param {ResponseOptions} [opts]
 */
export const success = (res, { data = null, message = 'OK', status = 200, count } = {}) => {
  const envelope = { success: true }
  if (message) envelope.message = message
  if (data !== null) envelope.data = data
  if (typeof count === 'number') envelope.count = count
  return res.status(status).json(envelope)
}

/**
 * @param {import('express').Response} res
 * @param {ResponseOptions} [opts]
 */
export const fail = (res, { message = 'Error', status = 500, errors = null } = {}) => {
  const envelope = { success: false, message }
  if (errors) envelope.errors = errors
  return res.status(status).json(envelope)
}
