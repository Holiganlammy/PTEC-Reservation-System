// Version: 1.0.0 | Date: 2026-07-10 16:00:00 | Updated: proxy login/OTP/change-password ไป Portal backend (reservation ไม่มีตาราง User เอง)
import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import type { Request, Response } from 'express';

// Portal backend ใช้ self-signed cert ตอน dev — ต้อง bypass cert verification เฉพาะ call นี้
const portalAgent = new https.Agent({ rejectUnauthorized: false });

@Controller()
export class AuthController {
  private readonly portalUrl = process.env.PORTAL_API_URL;

  @Post('login')
  login(
    @Body() body: { loginname: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal(
      '/login',
      { ...body, source: 'reservation' },
      req,
      res,
    );
  }

  @Post('verify-otp')
  verifyOtp(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal(
      '/verify-otp',
      { ...body, source: 'reservation' },
      req,
      res,
    );
  }

  @Post('resend-otp')
  resendOtp(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal(
      '/resend-otp',
      { ...body, source: 'reservation' },
      req,
      res,
    );
  }

  @Post('send-otp')
  sendOtp(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal(
      '/send-otp',
      { ...body, source: 'reservation' },
      req,
      res,
    );
  }

  @Post('user/change-password')
  changePassword(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal('/user/change-password', body, req, res);
  }

  // เมนู dynamic จาก Portal — timeout สั้นกว่า เพราะฝั่ง frontend จะ fallback เป็น static menu
  // ถ้าดึงไม่ทัน ไม่อยากให้ sidebar ค้างรอนาน
  @Post('menu')
  getMenu(
    @Body() body: { UserID: number },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyToPortal('/Apps_List_Menu', body, req, res, 4000);
  }

  private async proxyToPortal(
    path: string,
    body: Record<string, unknown>,
    req: Request,
    res: Response,
    timeout = 10000,
  ) {
    try {
      const response = await axios.post(`${this.portalUrl}${path}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.cookie ?? '',
          // /Apps_List_Menu (และ endpoint อื่นที่ต้อง login แล้ว) เช็คสิทธิ์จาก Bearer token
          // ไม่ใช่แค่ cookie — ต้อง forward Authorization ต่อไปด้วย ไม่งั้น Portal ตอบ 401 เสมอ
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        httpsAgent: portalAgent,
        timeout,
      });

      this.forwardCookies(response.headers['set-cookie'], res);
      return res.status(response.status).json(response.data);
    } catch (error: unknown) {
      console.error(`Portal proxy error [${path}]:`, error);
      return this.handleProxyError(error, res);
    }
  }

  private forwardCookies(portalCookies: string[] | undefined, res: Response) {
    if (!portalCookies) return;
    const isDevelopment = process.env.NODE_ENV !== 'production';

    portalCookies
      .map((cookie) => {
        let modified = cookie;
        if (isDevelopment) modified = modified.replace(/; Secure/gi, '');
        if (modified.includes('SameSite=None')) {
          modified = modified.replace(/SameSite=None/gi, 'SameSite=Lax');
        }
        return modified;
      })
      .forEach((cookie) => res.append('Set-Cookie', cookie));
  }

  private handleProxyError(error: unknown, res: Response) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      if (error.code === 'ECONNREFUSED') {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          success: false,
          message: 'Authentication service is unavailable',
        });
      }
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return res.status(HttpStatus.REQUEST_TIMEOUT).json({
          success: false,
          message: 'Request timeout',
        });
      }
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unexpected error',
    });
  }
}
