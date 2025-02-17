import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchedAccount } from '../types/account';
import { AlgorandService } from '../services/algorand';

const STORAGE_KEY = 'watched_accounts';

export function useWatchedAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['watched-accounts'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as WatchedAccount[] : [];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const addAccount = async (address: string) => {
    if (!AlgorandService.isValidAddress(address)) {
      throw new Error('Invalid Algorand address');
    }

    const newAccounts = [...accounts];
    if (newAccounts.some(acc => acc.address === address)) {
      throw new Error('Account already being watched');
    }

    try {
      const info = await AlgorandService.getAccountInfo(address);
      newAccounts.push({
        address,
        info,
        lastUpdated: Date.now(),
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
      queryClient.setQueryData(['watched-accounts'], newAccounts);
    } catch (error) {
      throw new Error(`Failed to add account: ${error.message}`);
    }
  };

  const removeAccount = async (address: string) => {
    const newAccounts = accounts.filter(acc => acc.address !== address);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
    queryClient.setQueryData(['watched-accounts'], newAccounts);
  };

  return {
    accounts,
    isLoading,
    error,
    addAccount,
    removeAccount,
  };
}