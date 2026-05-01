/** API tarafında oluşan hatalar için tip-güvenli sınıf. */
export class ApiError extends Error {
  status: number;
  serverMessage: string | null;

  constructor(status: number, message: string, serverMessage: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
}
