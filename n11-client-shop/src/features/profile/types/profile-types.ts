export interface UserProfile {
  id: string;
  authId: number;
  userName: string;
  name: string | null;
  surName: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  surName?: string;
  phone?: string;
  avatar?: string;
}
