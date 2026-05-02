import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  authApi,
  type AdminRegisterPayload,
  type LoginPayload,
  type RegisterPayload,
} from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store';

async function bootstrapSession(accessToken: string, refreshToken: string) {
  const { setTokens, setUser, clear } = useAuthStore.getState();
  setTokens({ accessToken, refreshToken });
  try {
    const me = await authApi.me();
    if (me.role !== 'ADMIN') {
      clear();
      toast.error('Bu panel yalnızca yöneticiler içindir.');
      return false;
    }
    setUser(me);
    return true;
  } catch {
    clear();
    return false;
  }
}

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokens) => {
      const ok = await bootstrapSession(tokens.accessToken, tokens.refreshToken);
      if (ok) {
        toast.success('Hoş geldin!');
        navigate('/dashboard', { replace: true });
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success('Hesap oluşturuldu — şimdi giriş yapabilirsin.');
    },
  });
}

export function useAdminRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: AdminRegisterPayload) => {
      await authApi.adminRegister(payload);
      return authApi.login({ userName: payload.userName, password: payload.password });
    },
    onSuccess: async (tokens) => {
      const ok = await bootstrapSession(tokens.accessToken, tokens.refreshToken);
      if (ok) {
        toast.success('Admin hesabı oluşturuldu, hoş geldin!');
        navigate('/dashboard', { replace: true });
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const rt = useAuthStore.getState().refreshToken;
      if (rt) {
        await authApi.logout(rt).catch(() => undefined);
      }
    },
    onSettled: () => {
      useAuthStore.getState().clear();
      navigate('/login', { replace: true });
    },
  });
}
