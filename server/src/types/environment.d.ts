declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGO_URI: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      ENCRYPT_SECRET: string;
      ENABLE_HTTPS: string;
      SSL_KEY_PATH?: string;
      SSL_CERT_PATH?: string;
      CLIENT_URL: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      OPENAI_API_KEY?: string;
      SENDGRID_API_KEY?: string;
      SENDGRID_FROM_EMAIL?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      AWS_S3_BUCKET?: string;
    }
  }
}

// Export this to make it a module
export {}; 