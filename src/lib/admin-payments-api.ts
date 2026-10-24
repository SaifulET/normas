import { apiRequest, type ApiSuccessResponse } from "./api";

export type AdminPaymentUser = {
  email?: string;
  id: string;
  name?: string;
  role?: string;
};

export type AdminPaymentRecord = {
  amount?: number;
  createdAt?: string;
  currency?: string;
  hostedInvoiceUrl?: string;
  id: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  paymentDate?: string;
  planTitle?: string;
  planType?: string;
  productType?: string;
  status?: string;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  updatedAt?: string;
  user?: AdminPaymentUser | null;
};

export type AdminPaymentsPagination = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

type AdminPaymentsResponse = ApiSuccessResponse<{
  pagination?: AdminPaymentsPagination;
  payments?: AdminPaymentRecord[];
}>;

export function getAdminPayments(params: { limit?: number; page?: number; search?: string } = {}) {
  return apiRequest<AdminPaymentsResponse>({
    method: "GET",
    params,
    url: "admin/payments",
  });
}

export function getAdminPayment(paymentId: string) {
  return apiRequest<ApiSuccessResponse<AdminPaymentRecord>>({
    method: "GET",
    url: `admin/payments/${paymentId}`,
  });
}

export function deleteAdminPayment(paymentId: string) {
  return apiRequest<ApiSuccessResponse<{ id?: string; message?: string }>>({
    method: "DELETE",
    url: `admin/payments/${paymentId}`,
  });
}
