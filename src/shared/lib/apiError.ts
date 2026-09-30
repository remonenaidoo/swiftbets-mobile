export interface ErrorEnvelopeShape {
  status: number;
  code: string;
  correlationId: string;
  title: string;
  detail?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId: string | undefined;

  constructor(status: number, envelope?: ErrorEnvelopeShape) {
    super(envelope?.detail ?? envelope?.title ?? `Request failed with ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = envelope?.code ?? `http_${status}`;
    this.correlationId = envelope?.correlationId;
  }
}
