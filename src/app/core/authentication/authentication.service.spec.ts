import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { CredentialsService } from './credentials.service';
import { MockCredentialsService } from './credentials.service.mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Credentials } from 'src/app/data/schemas/credentials';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let credentialsService: MockCredentialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CredentialsService, useClass: MockCredentialsService }, AuthenticationService]
    });

    authenticationService = TestBed.get(AuthenticationService);
    credentialsService = TestBed.get(CredentialsService);
    credentialsService.credentials = null;
    spyOn(credentialsService, 'setCredentials').and.callThrough();
  });

  describe('login', () => {
    it('should return credentials', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(credentials => {
        expect(credentials).toBeDefined();
        expect(credentials.token).toBeDefined();
      });
    }));

    it('should authenticate user', fakeAsync(() => {
      expect(credentialsService.isAuthenticated()).toBe(false);

      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(credentialsService.isAuthenticated()).toBe(true);
        expect(credentialsService.credentials).not.toBeNull();
        expect((credentialsService.credentials as Credentials).token).toBeDefined();
        expect((credentialsService.credentials as Credentials).token).not.toBeNull();
      });
    }));

    it('should persist credentials for the session', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'admin',
        password: 'password'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(credentialsService.setCredentials).toHaveBeenCalled();
        expect((credentialsService.setCredentials as jasmine.Spy).calls.mostRecent().args[1]).toBe(undefined);
      });
    }));

    it('should persist credentials across sessions', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'admin',
        password: 'password'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(credentialsService.setCredentials).toHaveBeenCalled();
        expect((credentialsService.setCredentials as jasmine.Spy).calls.mostRecent().args[1]).toBe(true);
      });
    }));
  });

  describe('logout', () => {
    it('should clear user authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      loginRequest.subscribe(() => {
        expect(credentialsService.isAuthenticated()).toBe(true);

        const request = authenticationService.logout();
        tick();

        request.subscribe(() => {
          expect(credentialsService.isAuthenticated()).toBe(false);
          expect(credentialsService.credentials).toBeNull();
        });
      });
    }));
  });
});
