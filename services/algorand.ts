import { AccountInfo, AssetInfo } from '../types/account';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TESTNET_BASE_URL = 'https://testnet-api.algonode.cloud/v2';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

export class AlgorandService {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async fetchWithRetry(url: string, attempts: number = RETRY_ATTEMPTS): Promise<Response> {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
        
        if (response.status === 429) {
          await this.delay(RETRY_DELAY * (i + 1));
          continue;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        if (i === attempts - 1) throw error;
        await this.delay(RETRY_DELAY);
      }
    }
    throw new Error('Max retry attempts reached');
  }

  static async getAccountInfo(address: string): Promise<AccountInfo> {
    try {
      const response = await this.fetchWithRetry(`${TESTNET_BASE_URL}/accounts/${address}`);
      const data = await response.json();
      
      // Fetch asset details for each asset
      const assetPromises = data.assets?.map(async (asset: any) => {
        try {
          const assetResponse = await this.fetchWithRetry(
            `${TESTNET_BASE_URL}/assets/${asset['asset-id']}`
          );
          const assetData = await assetResponse.json();
          
          return {
            id: asset['asset-id'],
            name: assetData.params.name,
            unitName: assetData.params['unit-name'],
            total: assetData.params.total,
            decimals: assetData.params.decimals,
            frozen: asset['is-frozen'],
            url: assetData.params.url,
            amount: asset.amount,
          };
        } catch (error) {
          console.error(`Failed to fetch asset info for ${asset['asset-id']}:`, error);
          return null;
        }
      }) || [];

      const assets = (await Promise.all(assetPromises)).filter(Boolean);
      return { ...data, assets };
    } catch (error) {
      console.error(`Failed to fetch account info for ${address}:`, error);
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  static isValidAddress(address: string): boolean {
    return /^[A-Z2-7]{58}$/.test(address);
  }

  static formatAlgoBalance(amount: number): string {
    return (amount / 1e6).toFixed(6);
  }

  static formatAssetBalance(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static async compareAccountStates(
    oldState: AccountInfo | null,
    newState: AccountInfo
  ): Promise<{ hasChanged: boolean; changes: string[] }> {
    if (!oldState) {
      return { hasChanged: false, changes: [] };
    }

    const changes: string[] = [];
    const oldBalance = this.formatAlgoBalance(oldState.amount);
    const newBalance = this.formatAlgoBalance(newState.amount);

    if (oldState.amount !== newState.amount) {
      changes.push(
        `Balance changed from ${oldBalance} ALGO to ${newBalance} ALGO`
      );
    }

    // Compare asset balances
    newState.assets?.forEach(newAsset => {
      const oldAsset = oldState.assets?.find(a => a.id === newAsset.id);
      if (oldAsset && oldAsset.amount !== newAsset.amount) {
        const oldAssetBalance = this.formatAssetBalance(oldAsset.amount, oldAsset.decimals);
        const newAssetBalance = this.formatAssetBalance(newAsset.amount, newAsset.decimals);
        changes.push(
          `${newAsset.name} balance changed from ${oldAssetBalance} to ${newAssetBalance} ${newAsset.unitName}`
        );
      }
    });

    return {
      hasChanged: changes.length > 0,
      changes,
    };
  }
}