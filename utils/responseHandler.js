// utils/responseHandler.js

function success(res, data = {}, message = 'Operación exitosa', status = 200) {
  return res.status(status).json({
    ok: true,
    message,
    data
  });
}

function error(res, err = {}, message = 'Ocurrió un error', status = 500) {
  return res.status(status).json({
    ok: false,
    message,
    error: err.message || err
  });
}

module.exports = {
  success,
  error
}; 