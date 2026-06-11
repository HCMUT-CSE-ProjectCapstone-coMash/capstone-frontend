export interface CreateTransferPaymentRequest {
    orderCode: number;
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
}

export interface CreateTransferPaymentResponse {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
}