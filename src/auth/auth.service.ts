import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { COMPLAINTS_ROLE, JwtPayload } from './jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const iamUrl = process.env.IAM_URL;

    let data: any;
    try {
      const res = await fetch(`${iamUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      data = await res.json();
      if (!res.ok) throw new UnauthorizedException(data.message ?? 'Invalid credentials');
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Could not reach authentication server');
    }

    const payload = this.jwtService.decode<JwtPayload>(data.access_token);
    if (!payload || payload.roleName !== COMPLAINTS_ROLE) {
      throw new UnauthorizedException('Access denied: your role cannot access this system');
    }

    return { access_token: data.access_token, refresh_token: data.refresh_token };
  }
}
