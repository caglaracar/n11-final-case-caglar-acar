import { http } from "./http";
import type { Page, UpdateProfileRequest, UserProfile } from "@/types/api";

export const userService = {
  me: () => http.get<UserProfile>("/user-profile/me"),
  update: (body: UpdateProfileRequest) =>
    http.put<UserProfile>("/user-profile/update", body),
  search: (q: string, page = 0, size = 20, role?: string) =>
    http.get<Page<UserProfile>>("/user-profile/search", {
      query: { q, page, size, ...(role ? { role } : {}) },
    }),
};
