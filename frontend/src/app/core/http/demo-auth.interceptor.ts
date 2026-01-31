import { HttpInterceptorFn } from '@angular/common/http';

/** Demo user so backend returns seeded data. Backend expects x-user-id (and optionally x-tenant-id). */
const DEMO_USER_ID = 'demo-user';
const DEMO_TENANT_ID = 'default';

export const demoAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: {
      'x-user-id': DEMO_USER_ID,
      'x-tenant-id': DEMO_TENANT_ID,
    },
  });
  return next(cloned);
};
