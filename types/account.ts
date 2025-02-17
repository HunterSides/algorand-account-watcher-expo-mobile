export interface AssetInfo {
  id: number;
  name: string;
  unitName: string;
  total: number;
  decimals: number;
  frozen: boolean;
  url?: string;
  amount: number;
  lastTransaction?: string;
}

export interface AccountInfo {
  address: string;
  amount: number;
  'amount-without-pending-rewards': number;
  'apps-local-state': any[];
  'apps-total-schema': {
    'num-byte-slice': number;
    'num-uint': number;
  };
  'created-apps': any[];
  'created-assets': any[];
  assets: AssetInfo[];
  'min-balance': number;
  'pending-rewards': number;
  'reward-base': number;
  rewards: number;
  round: number;
  status: string;
  'total-apps-opted-in': number;
  'total-assets-opted-in': number;
  'total-created-apps': number;
  'total-created-assets': number;
}

export interface WatchedAccount {
  address: string;
  info: AccountInfo | null;
  lastUpdated: number;
  error?: string;
}

export interface AccountStateChange {
  address: string;
  oldBalance: number;
  newBalance: number;
  timestamp: number;
}