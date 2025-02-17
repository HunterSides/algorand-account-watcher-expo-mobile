import { AccountInfo } from '../types/account';

const TESTNET_BASE_URL = 'https://testnet-api.algonode.cloud/v2';

export class AlgorandService {
  static async getAccountInfo(address: string): Promise<AccountInfo> {
    try {
      const response = await fetch(`${TESTNET_BASE_URL}/accounts/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  static isValidAddress(address: string): boolean {
    // Basic Algorand address validation
    return /^[A-Z2-7]{58}$/.test(address);
  }
}