import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const authUrls = ['/api/token/', '/api/token/refresh/', '/api/register/'];

function isAuthUrl(url: string): boolean {
  return authUrls.some((x) => url.includes(x));
}

function withToken<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccess();
  const request = token && !isAuthUrl(req.url) ? withToken(req, token) : req;

  return next(request).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthUrl(req.url) &&
        auth.getRefresh()
      ) {
        return auth.refresh().pipe(
          switchMap(({ access }) => next(withToken(req, access)))
        );
      }
      return throwError(() => error);
    })
  );
};
