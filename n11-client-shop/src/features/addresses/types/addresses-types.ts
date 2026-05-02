export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean };
