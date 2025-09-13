import { NextResponse } from 'next/server';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export class ApiErrorResponse {
  static badRequest(message: string, details?: any): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message,
          details,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  static unauthorized(message = 'Unauthorized'): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 }
    );
  }

  static forbidden(message = 'Forbidden'): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 403 }
    );
  }

  static notFound(message = 'Resource not found'): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 404 }
    );
  }

  static tooManyRequests(message = 'Too many requests'): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 429 }
    );
  }

  static internalError(message = 'Internal server error', details?: any): NextResponse<ApiError> {
    // In production, don't expose internal error details
    const safeDetails = process.env.NODE_ENV === 'development' ? details : undefined;
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message,
          details: safeDetails,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): NextResponse<ApiError> {
    return NextResponse.json(
      {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 503 }
    );
  }
}
