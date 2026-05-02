import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Address, AddressInput } from '@/features/addresses/types';

async function listAddresses(): Promise<Address[]> {
  const request = api.get<BaseResponse<Address[]>>(ENDPOINTS.address.list);
  return unwrap(request);
}

async function createAddress(payload: AddressInput): Promise<Address> {
  const request = api.post<BaseResponse<Address>>(ENDPOINTS.address.create, payload);
  return unwrap(request);
}

async function updateAddress(id: string, payload: AddressInput): Promise<Address> {
  const request = api.put<BaseResponse<Address>>(ENDPOINTS.address.update(id), payload);
  return unwrap(request);
}

async function removeAddress(id: string): Promise<void> {
  const request = api.delete<BaseResponse<void>>(ENDPOINTS.address.remove(id));
  await unwrap(request);
}

async function setDefaultAddress(id: string): Promise<Address> {
  const request = api.post<BaseResponse<Address>>(ENDPOINTS.address.setDefault(id));
  return unwrap(request);
}

export const addressApi = {
  list: listAddresses,
  create: createAddress,
  update: updateAddress,
  remove: removeAddress,
  setDefault: setDefaultAddress,
};
