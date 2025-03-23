import logger from './logger';

/**
 * Logs authentication-related operations
 */
const authLogger = {
  /**
   * Log successful login attempts
   * @param userId User ID
   * @param email Email used for login
   * @param ip IP address of the client
   * @param userAgent User-Agent from request headers
   */
  loginSuccess: (userId: string, email: string, ip: string, userAgent?: string) => {
    logger.info('Login successful', {
      meta: {
        auth: {
          event: 'login_success',
          userId,
          email,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log failed login attempts
   * @param email Email used for login attempt
   * @param reason Reason for login failure
   * @param ip IP address of the client
   * @param userAgent User-Agent from request headers
   */
  loginFailure: (email: string, reason: string, ip: string, userAgent?: string) => {
    logger.warn('Login failed', {
      meta: {
        auth: {
          event: 'login_failure',
          email,
          reason,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log user registration
   * @param userId User ID
   * @param email Email used for registration
   * @param ip IP address of the client
   * @param userAgent User-Agent from request headers
   */
  registration: (userId: string, email: string, ip: string, userAgent?: string) => {
    logger.info('User registered', {
      meta: {
        auth: {
          event: 'registration',
          userId,
          email,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log user logout
   * @param userId User ID
   * @param ip IP address of the client
   */
  logout: (userId: string, ip: string) => {
    logger.info('User logged out', {
      meta: {
        auth: {
          event: 'logout',
          userId,
          ip,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log password reset request
   * @param email Email used for password reset
   * @param ip IP address of the client
   */
  passwordResetRequest: (email: string, ip: string) => {
    logger.info('Password reset requested', {
      meta: {
        auth: {
          event: 'password_reset_request',
          email,
          ip,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log successful password reset
   * @param userId User ID
   * @param email Email of the user
   * @param ip IP address of the client
   */
  passwordResetSuccess: (userId: string, email: string, ip: string) => {
    logger.info('Password reset successful', {
      meta: {
        auth: {
          event: 'password_reset_success',
          userId,
          email,
          ip,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log JWT token verification
   * @param userId User ID
   * @param tokenType Type of token (e.g., 'access', 'refresh')
   * @param success Whether verification was successful
   */
  tokenVerification: (userId: string, tokenType: string, success: boolean) => {
    const level = success ? 'debug' : 'warn';
    const event = success ? 'token_verification_success' : 'token_verification_failure';
    
    logger[level](`Token verification ${success ? 'successful' : 'failed'}`, {
      meta: {
        auth: {
          event,
          userId,
          tokenType,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },
};

export default authLogger; 