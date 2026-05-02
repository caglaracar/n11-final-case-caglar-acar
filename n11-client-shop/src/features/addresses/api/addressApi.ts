import { api, unwrap, type BaseResponse } from '@/shared/lib/api/client';
import { ENDPOINTS } from '@/shared/lib/api/endpoints';
import type { Address, AddressInput } from '@/features/addresses/types/addresses-types';

export async function getMyAddresses(): Promise<Address[]> {
  return unwrap(api.get<BaseResponse<Address[]>>(ENDPOINTS.address.list));
}

export async function createAddress(payload: AddressInput): Promise<Address> {
  return unwrap(api.post<BaseResponse<Address>>(ENDPOINTS.address.create, payload));
}

export async function updateAddress(addressId: string, payload: AddressInput): Promise<Address> {
  return unwrap(api.put<BaseResponse<Address>>(ENDPOINTS.address.update(addressId), payload));
}

export async function deleteAddress(addressId: string): Promise<void> {
  await unwrap(api.delete<BaseResponse<void>>(ENDPOINTS.address.remove(addressId)));
}

export async function setDefaultAddress(addressId: string): Promise<Address> {
  return unwrap(api.post<BaseResponse<Address>>(ENDPOINTS.address.setDefault(addressId)));
}
