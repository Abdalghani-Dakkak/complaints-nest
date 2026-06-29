import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface IamLogPayload {
  userId?: number;
  procedureType: string;
  state?: 'success' | 'failure';
  department?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Sends complaints-system audit logs to IAM's POST /logs so all activity is
 * visible centrally in IAM. Because we share IAM's JWT_SECRET, we mint a
 * short-lived service token to authenticate the call. Fire-and-forget: a
 * logging failure never affects the user's request.
 */
@Injectable()
export class IamLogService {
  private readonly logger = new Logger(IamLogService.name);

  constructor(private readonly jwt: JwtService) {}

  async send(payload: IamLogPayload): Promise<void> {
    const url = process.env.IAM_URL;
    if (!url) return;
    try {
      const token = await this.jwt.signAsync(
        { sub: 0, email: 'system@complaints', username: 'complaints-system' },
        { expiresIn: '2m' },
      );
      const res = await fetch(`${url}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        this.logger.warn(`IAM /logs responded ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(
        `Failed to send log to IAM: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
