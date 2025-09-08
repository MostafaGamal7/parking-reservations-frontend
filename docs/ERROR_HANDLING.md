# Error Handling Patterns

This document outlines the error handling patterns used in the WeLink frontend application.

## Error Hierarchy

### 1. API Errors (`ApiError`)
- **Location**: `src/services/api.ts`
- **Usage**: Wraps all API-related errors with status codes and user-friendly messages
- **Example**:
  ```typescript
  throw new ApiError(404, 'User not found');
  ```

### 2. Logger Utility
- **Location**: `src/lib/logger.ts`
- **Features**:
  - Environment-aware logging (development vs production)
  - Different log levels (debug, info, warn, error)
  - No-op in production for debug logs
- **Usage**:
  ```typescript
  import { logger } from '@/lib/logger';
  
  logger.debug('Debug message');
  logger.error('Error message', error);
  ```

### 3. Error Boundaries
- **Component**: `ErrorBoundary`
- **Location**: `src/components/ui/ErrorBoundary.tsx`
- **Features**:
  - Catches React component tree errors
  - Provides fallback UI
  - Logs errors to the error tracking service
- **Usage**:
  ```tsx
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
  ```

## Best Practices

### 1. Error Handling in Components
- Use `try/catch` for async operations
- Display user-friendly error messages
- Log errors using the logger utility
- Use error boundaries for component tree errors

### 2. API Error Handling
- Always wrap API calls in try/catch
- Use `ApiError` for consistent error responses
- Include error boundaries around API-consuming components

### 3. Logging
- Use appropriate log levels:
  - `debug`: Detailed debug information
  - `info`: General information
  - `warn`: Potentially problematic situations
  - `error`: Errors that need attention
- Never log sensitive information
- Use structured logging for better searchability

## Common Patterns

### 1. Handling Form Errors
```typescript
try {
  await submitForm(data);
} catch (error) {
  if (error instanceof ApiError) {
    setError(error.message);
  } else {
    logger.error('Form submission failed', error);
    setError('An unexpected error occurred');
  }
}
```

### 2. API Service Error Handling
```typescript
export const fetchData = async (params) => {
  try {
    const response = await api.get('/endpoint', { params });
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch data', error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || 'Failed to fetch data'
    );
  }
};
```

## Testing Error Handling
1. Test error boundaries by throwing errors in components
2. Test API error responses
3. Verify error logging in development mode
4. Test error UI in different scenarios

## Monitoring and Alerting
- Errors are automatically logged to the console in development
- In production, errors are sent to the error tracking service
- Set up alerts for critical errors in production
