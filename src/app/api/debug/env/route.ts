import { NextResponse } from 'next/server';

export async function GET() {
  const emailProvider = process.env.EMAIL_PROVIDER;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
  const sendgridFromName = process.env.SENDGRID_FROM_NAME;
  const nodeEnv = process.env.NODE_ENV;

  return NextResponse.json({
    EMAIL_PROVIDER: emailProvider || '(not set)',
    SENDGRID_API_KEY: sendgridApiKey
      ? `[SET - ${sendgridApiKey.substring(0, 10)}...]`
      : '(not set)',
    SENDGRID_FROM_EMAIL: sendgridFromEmail || '(not set)',
    SENDGRID_FROM_NAME: sendgridFromName || '(not set)',
    NODE_ENV: nodeEnv || '(not set)',
  });
}
