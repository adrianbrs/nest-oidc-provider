import { ExecutionContext } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

export function validatePaths(...pathnames: string[]) {
  if (!pathnames?.length) return '/';
  return `/${pathnames.join('/')}`.replace(/\/+$/, '').replace(/\/+/g, '/');
}

export function getReqRes(ctx: ExecutionContext) {
  const http = ctx.switchToHttp();
  return {
    req: http.getRequest<IncomingMessage>(),
    res: http.getResponse<ServerResponse>(),
  };
}
