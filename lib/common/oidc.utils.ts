import { ExecutionContext } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

export function validatePath(pathname?: string) {
  return (
    '/' +
    (pathname || '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\/+/g, '/')
  );
}

export function getReqRes(ctx: ExecutionContext) {
  const http = ctx.switchToHttp();
  return {
    req: http.getRequest<IncomingMessage>(),
    res: http.getResponse<ServerResponse>(),
  };
}
