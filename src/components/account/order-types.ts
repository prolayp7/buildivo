export type AccountOrderItem = {
  id: number;
  productVariantId: number;
  titleSnapshot: string;
  variantTitleSnapshot: string;
  skuSnapshot: string | null;
  quantity: number;
  subtotal: string | number;
  vatAmount: string | number;
};

export type AccountOrder = {
  uuid: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  placedAt: string;
  shippingCompanyName: string | null;
  shippingLine1: string;
  shippingCity: string;
  shippingPostcode: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  subtotal: string | number;
  vatTotal: string | number;
  total: string | number;
  items: AccountOrderItem[];
};

export type AccountOrderPage = {
  items: AccountOrder[];
  meta: { page: number; total: number; totalPages: number };
};
