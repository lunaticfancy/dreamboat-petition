// ============================================
// Verification Email Template
// ============================================

/**
 * Data required for verification email template
 */
export interface VerificationTemplateData {
  /** 6-digit verification code */
  code: string;
  /** Number of minutes until code expires */
  expiryMinutes: number;
}

/**
 * Creates verification email content
 * @param data - Template data (code and expiry)
 * @returns Email subject, text, and HTML content
 */
export function createVerificationEmail(data: VerificationTemplateData): {
  subject: string;
  text: string;
  html: string;
} {
  const { code, expiryMinutes } = data;
  const senderName =
    process.env.SMTP_FROM_NAME ||
    process.env.SENDGRID_FROM_NAME ||
    '드림보트 어린이집 운영위원회';

  const subject = `[드림보트 소통함] 이메일 인증코드`;

  const text = `
인증 코드: ${code}

이 코드는 ${expiryMinutes}분 후에 만료됩니다.

본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.

좋은 의견, 칭찬, 바라는 점 함께 나눠주세요.

감사합니다.
${senderName} 팀
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f7f8;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
    <h1 style="color: #2b8cee; font-size: 24px; margin: 0 0 24px 0; text-align: center;">
      이메일 인증
    </h1>
    
    <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
      아래 인증 코드를 입력해주세요
    </p>
    
    <div style="background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2b8cee;">
        ${code}
      </span>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
      이 코드는 <strong>${expiryMinutes}분</strong> 후에 만료됩니다.
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
      본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
      좋은 의견, 칭찬, 바라는 점 함께 나눠주세요.
    </p>
  </div>
  
  <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
    감사합니다.<br>
    ${senderName} 팀
  </p>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
