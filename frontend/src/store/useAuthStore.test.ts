import { AuthResponse } from '../types';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('persists auth response, updates user profile, and clears on logout', () => {
    const authPayload: AuthResponse = {
      accessToken: 'jwt-token-123',
      user: {
        id: 'user-1',
        email: 'customer@brewlite.vn',
        fullName: 'Nguyễn Minh Khách',
        phone: '0901234567',
        role: 'CUSTOMER',
        loyaltyPoints: 25,
        createdAt: '2026-11-09T03:00:00.000Z',
      },
    };

    useAuthStore.getState().setAuth(authPayload);
    expect(useAuthStore.getState().accessToken).toBe('jwt-token-123');
    expect(useAuthStore.getState().user?.email).toBe('customer@brewlite.vn');

    const persistedRaw = localStorage.getItem('brewlite-auth-storage');
    expect(persistedRaw).toContain('jwt-token-123');

    useAuthStore.getState().setUser({
      ...authPayload.user,
      loyaltyPoints: 40,
    });
    expect(useAuthStore.getState().user?.loyaltyPoints).toBe(40);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
