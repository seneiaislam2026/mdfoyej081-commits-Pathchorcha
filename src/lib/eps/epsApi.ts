import axios from 'axios';
import { generateHash } from './hashGenerator';

const BASE_URL = 'https://sandboxpgapi.eps.com.bd';

// EPS Credentials from Environment
const EPS_USERNAME = process.env.EPS_USERNAME || '';
const EPS_PASSWORD = process.env.EPS_PASSWORD || '';
const EPS_HASH_KEY = process.env.EPS_HASH_KEY || '';
const EPS_MERCHANT_ID = process.env.EPS_MERCHANT_ID || '';
const EPS_STORE_ID = process.env.EPS_STORE_ID || '';

/**
 * Step 1: Get Token
 */
export async function getEpsToken() {
  if (!EPS_USERNAME || !EPS_PASSWORD || !EPS_HASH_KEY) {
    throw new Error('EPS credentials are not fully configured.');
  }

  const hash = generateHash(EPS_HASH_KEY, EPS_USERNAME);

  const response = await axios.post(
    `${BASE_URL}/v1/Auth/GetToken`,
    {
      userName: EPS_USERNAME,
      password: EPS_PASSWORD,
    },
    {
      headers: {
        'x-hash': hash,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data; // { token: '...', expireDate: '...' }
}

/**
 * Step 2: Initialize Payment
 */
export async function initializePayment(data: {
  customerOrderId: string;
  merchantTransactionId: string;
  totalAmount: number;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPostcode?: string;
  customerCountry?: string;
  customerPhone: string;
  productName: string;
}) {
  const { token } = await getEpsToken();
  const hash = generateHash(EPS_HASH_KEY, data.merchantTransactionId);

  const payload = {
    storeId: EPS_STORE_ID,
    merchantTransactionId: data.merchantTransactionId,
    customerOrderId: data.customerOrderId,
    transactionTypeId: 1, // 1 = Web
    totalAmount: data.totalAmount,
    successUrl: data.successUrl,
    failUrl: data.failUrl,
    cancelUrl: data.cancelUrl,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerAddress: data.customerAddress || 'Address',
    customerCity: data.customerCity || 'Dhaka',
    customerState: data.customerState || 'Dhaka',
    customerPostcode: data.customerPostcode || '1000',
    customerCountry: data.customerCountry || 'BD',
    customerPhone: data.customerPhone,
    productName: data.productName,
  };

  const response = await axios.post(
    `${BASE_URL}/v1/EPSEngine/InitializeEPS`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-hash': hash,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data; // { TransactionId, RedirectURL, ErrorMessage }
}

/**
 * Step 3: Verify Payment Status
 */
export async function verifyPayment(merchantTransactionId: string) {
  const { token } = await getEpsToken();
  const hash = generateHash(EPS_HASH_KEY, merchantTransactionId);

  const response = await axios.get(
    `${BASE_URL}/v1/EPSEngine/CheckMerchantTransactionStatus`,
    {
      params: { merchantTransactionId },
      headers: {
        Authorization: `Bearer ${token}`,
        'x-hash': hash,
      },
    }
  );

  return response.data;
}
