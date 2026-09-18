export type AccountQuoteItem = {
  id: number;
  productVariantId: number;
  quantity: number;
  quotedUnitPrice: string | number | null;
  productVariant: { title: string; slug: string; product: { title: string; slug: string } };
};

export type AccountQuote = {
  uuid: string;
  companyName: string | null;
  contactName: string;
  email: string;
  status: string;
  quotedTotal: string | number | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: AccountQuoteItem[];
};

export type AccountQuotePage = {
  items: AccountQuote[];
  meta: { page: number; total: number; totalPages: number };
};
