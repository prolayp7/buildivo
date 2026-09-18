export type AddressType = "BILLING" | "SHIPPING" | "BOTH";

export type Address = {
  id: number;
  label: string | null;
  fullName: string;
  companyName: string | null;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  phone: string | null;
  addressType: AddressType;
  isDefault: boolean;
};

export type AddressInput = {
  label?: string;
  fullName: string;
  companyName?: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country?: string;
  phone?: string;
  addressType?: AddressType;
  isDefault?: boolean;
};
