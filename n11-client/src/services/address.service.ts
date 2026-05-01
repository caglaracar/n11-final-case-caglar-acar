import { http } from "./http";
import type { Address } from "@/types/api";

const enc = encodeURIComponent;

export const addressService = {
  list: () => http.get<Address[]>("/address"),
  create: (body: Omit<Address, "id">) => http.post<Address>("/address/create", body),
  update: (id: string, body: Omit<Address, "id">) =>
    http.put<Address>(`/address/update/${enc(id)}`, body),
  delete: (id: string) => http.delete<void>(`/address/delete/${enc(id)}`),
  setDefault: (id: string) => http.post<Address>(`/address/default/${enc(id)}`),
};
