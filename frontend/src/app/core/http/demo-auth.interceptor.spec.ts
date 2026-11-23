import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { demoAuthInterceptor } from './demo-auth.interceptor';

describe('demoAuthInterceptor', () => {
  it('adds the demo user and tenant headers', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([demoAuthInterceptor])), provideHttpClientTesting()],
    });
    TestBed.inject(HttpClient).get('/api/v1/conversations').subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('/api/v1/conversations');
    expect(req.request.headers.get('x-user-id')).toBe('demo-user');
    expect(req.request.headers.get('x-tenant-id')).toBe('default');
    req.flush({ data: [] });
  });
});
