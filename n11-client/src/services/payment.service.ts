import { http } from "./http";
import type { CheckoutRequest, PaymentResponse } from "@/types/api";

export const paymentService = {
  checkout: (body: CheckoutRequest) =>
    http.post<PaymentResponse>("/payment/checkout", body),
};
