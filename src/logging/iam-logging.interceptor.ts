import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { IamLogService } from './iam-log.service';

const AUDITED_METHODS = ['POST', 'PATCH', 'DELETE'];

/**
 * Auto-sends a log to IAM for every mutating complaints request (POST/PATCH/
 * DELETE), tagged with the acting user (if authenticated) and success/failure.
 * Skips /auth (IAM already logs logins) and read-only GETs.
 */
@Injectable()
export class IamLoggingInterceptor implements NestInterceptor {
  constructor(private readonly iamLog: IamLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const url: string = req.originalUrl || req.url || '';

    if (!AUDITED_METHODS.includes(method) || url.startsWith('/auth')) {
      return next.handle();
    }

    const res = context.switchToHttp().getResponse();
    const routePath = req.route?.path || url.split('?')[0];
    const procedureType = `complaints ${method} ${routePath}`.slice(0, 100);
    const userId: number | undefined = req.user?.sub;
    const ipAddress: string | undefined =
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;
    const userAgent: string | undefined = req.headers?.['user-agent'];

    // Public actions (e.g. citizen submit) have no IAM user — capture the
    // citizen's identity from the request body instead, into metadata.
    const citizen = req.body?.citizen;
    const hasCitizen =
      userId === undefined && citizen && typeof citizen === 'object';
    const who = hasCitizen
      ? ` | citizen: ${[citizen.firstName, citizen.lastName]
          .filter(Boolean)
          .join(' ')} (${citizen.nationalNumber ?? ''})`
      : '';

    const base = {
      userId,
      procedureType,
      ipAddress,
      userAgent,
      method,
      path: routePath,
      ...(hasCitizen ? { metadata: { citizen } } : {}),
    };

    return next.handle().pipe(
      tap(() => {
        void this.iamLog.send({
          ...base,
          state: 'success',
          statusCode: res?.statusCode,
          description: `${method} ${url}${who}`.slice(0, 500),
        });
      }),
      catchError((err) => {
        void this.iamLog.send({
          ...base,
          state: 'failure',
          statusCode: err?.status,
          description: `${method} ${url} -> ${err?.status ?? 'error'}${who}`.slice(
            0,
            500,
          ),
        });
        return throwError(() => err);
      }),
    );
  }
}
