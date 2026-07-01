import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { complaintsSystemId } from './constants';
import { JwtPayload } from './jwt-auth.guard';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface IamLoginResponse extends AuthTokens {
  message?: string;
  user: Record<string, unknown>;
  role: Record<string, unknown> | null;
  permissions: unknown[];
}

export interface LoginResult extends AuthTokens {
  user: Record<string, unknown>;
  role: Record<string, unknown> | null;
  permissions: unknown[];
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const iamUrl = process.env.IAM_URL;

    let data: IamLoginResponse;
    try {
      const res = await fetch(`${iamUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      data = (await res.json()) as IamLoginResponse;
      if (!res.ok) {
        throw new UnauthorizedException(data.message ?? 'Invalid credentials');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Could not reach authentication server');
    }

    const payload = this.jwtService.decode<JwtPayload>(data.access_token);
    if (!payload || payload.systemId !== complaintsSystemId) {
      throw new UnauthorizedException(
        'Access denied: your role cannot access this system',
      );
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
      role: data.role,
      permissions: data.permissions,
    };
  }
}
