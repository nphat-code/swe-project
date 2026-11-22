import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface PayosPaymentLinkRequest {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayosPaymentLinkData {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface PayosPaymentInfoData {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: Array<{
    reference: string;
    amount: number;
    accountNumber: string;
    description: string;
    transactionDateTime: string;
  }>;
}

interface PayosApiEnvelope<T> {
  code: string;
  desc: string;
  data?: T;
  signature?: string;
}

@Injectable()
export class PayosService {
  private readonly apiBaseUrl = 'https://api-merchant.payos.vn';

  private getCredentials(): { clientId: string; apiKey: string; checksumKey: string } {
    const clientId = process.env.PAYOS_CLIENT_ID?.trim() ?? '';
    const apiKey = process.env.PAYOS_API_KEY?.trim() ?? '';
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim() ?? '';

    if (!clientId || !apiKey || !checksumKey) {
      throw new ServiceUnavailableException(
        'Cổng thanh toán PayOS chưa được cấu hình trên máy chủ',
      );
    }

    return { clientId, apiKey, checksumKey };
  }

  private sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        const value = obj[key];
        if (Array.isArray(value)) {
          acc[key] = value.map((item) =>
            item && typeof item === 'object' && !Array.isArray(item)
              ? this.sortObjectKeys(item as Record<string, unknown>)
              : item,
          );
        } else if (value && typeof value === 'object') {
          acc[key] = this.sortObjectKeys(value as Record<string, unknown>);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
  }

  private buildQueryStringSignature(data: Record<string, unknown>, checksumKey: string): string {
    const pairs = Object.keys(data)
      .sort()
      .map((key) => {
        const rawValue = data[key];
        let normalized: string;
        if (rawValue === null || rawValue === undefined) {
          normalized = '';
        } else if (Array.isArray(rawValue)) {
          normalized = JSON.stringify(
            rawValue.map((item) =>
              item && typeof item === 'object' && !Array.isArray(item)
                ? this.sortObjectKeys(item as Record<string, unknown>)
                : item,
            ),
          );
        } else if (typeof rawValue === 'object') {
          normalized = JSON.stringify(this.sortObjectKeys(rawValue as Record<string, unknown>));
        } else {
          normalized = String(rawValue);
        }
        return `${key}=${normalized}`;
      });

    return createHmac('sha256', checksumKey).update(pairs.join('&')).digest('hex');
  }

  verifyWebhookSignature(data: Record<string, unknown>, signature: string): boolean {
    if (!signature || typeof signature !== 'string') {
      return false;
    }
    const { checksumKey } = this.getCredentials();
    const expected = this.buildQueryStringSignature(data, checksumKey);
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(signature.trim().toLowerCase(), 'utf8');
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, actualBuffer);
  }

  async createPaymentLink(request: PayosPaymentLinkRequest): Promise<PayosPaymentLinkData> {
    const { clientId, apiKey, checksumKey } = this.getCredentials();
    const signature = this.buildQueryStringSignature(
      {
        amount: request.amount,
        cancelUrl: request.cancelUrl,
        description: request.description,
        orderCode: request.orderCode,
        returnUrl: request.returnUrl,
      },
      checksumKey,
    );

    const response = await fetch(`${this.apiBaseUrl}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        ...request,
        signature,
      }),
    });

    const payload = (await response.json()) as PayosApiEnvelope<PayosPaymentLinkData>;
    if (!response.ok || payload.code !== '00' || !payload.data) {
      throw new BadGatewayException(
        payload.desc || 'Không thể khởi tạo mã thanh toán VietQR từ PayOS',
      );
    }

    return payload.data;
  }

  async getPaymentRequestInfo(orderCode: number | string): Promise<PayosPaymentInfoData> {
    const { clientId, apiKey } = this.getCredentials();

    const response = await fetch(`${this.apiBaseUrl}/v2/payment-requests/${orderCode}`, {
      method: 'GET',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
    });

    const payload = (await response.json()) as PayosApiEnvelope<PayosPaymentInfoData>;
    if (!response.ok || payload.code !== '00' || !payload.data) {
      throw new BadGatewayException(
        payload.desc || 'Không thể kiểm tra trạng thái thanh toán từ PayOS',
      );
    }

    return payload.data;
  }
}
