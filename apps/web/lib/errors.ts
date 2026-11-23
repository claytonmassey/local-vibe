export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown, requestId: string): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message, requestId } }, { status: error.status });
  }
  console.error(requestId, error);
  return Response.json(
    { error: { code: "internal", message: "Something went wrong. Nothing was posted.", requestId } },
    { status: 500 },
  );
}
