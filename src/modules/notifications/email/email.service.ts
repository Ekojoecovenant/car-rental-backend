import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string, fullName: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your Email - WatersMet Car Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #667eea;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Car Rental Platform!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              <p>Thank you for registering with us. To complete your registration, please verify your email address using the code below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #999; font-size: 14px;">This code will expire in 10 minutes</p>
              </div>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <p>Best regards,<br>Rento | Car Rentals/p>
            </div>
            <div class="footer">
              <p>© 2026 Rento | Car Rentals. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to Car Rental Platform! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .features {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .features ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .features li {
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              <p>Your email has been verified successfully! Welcome to Car Rental Platform.</p>
              
              <div class="features">
                <h3>What you can do now:</h3>
                <ul>
                  <li>✅ Browse our wide selection of vehicles</li>
                  <li>✅ Make bookings with ease</li>
                  <li>✅ Manage your rental history</li>
                  <li>✅ Update your profile settings</li>
                </ul>
              </div>
              
              <center>
                <a href="${this.configService.get('FRONTEND_URL')}/dashboard.html" class="button">
                  Go to Dashboard
                </a>
              </center>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Happy renting!<br>Rento | Car Rentals</p>
            </div>
            <div class="footer">
              <p>© 2026 Rento | Car Rentals. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

// reminder to use redis instead on user.entity to store verification token
// continue from sendWelcomEmail
// smth smth
