// Success response
export function successRes<T>(data: T, message = 'OK', status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

// Error response
export function errorRes(
  message = 'Something went wrong',
  status = 400,
  errors?: Record<string, string>
) {
  return Response.json({ success: false, message, errors }, { status });
}
