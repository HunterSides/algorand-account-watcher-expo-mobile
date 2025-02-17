import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchedAccount } from '../types/account';
import { AlgorandService } from '../services/algorand';
import Toast from 'react-native-toast-message';

const STORAGE_KEY = 'watched_accounts';
const POLLING_INTERVAL = 60000; // 60 seconds

export function useWatchedAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['watched-accounts'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const accounts: WatchedAccount[] = stored ? JSON.parse(stored) : [];
        
        // Update all account information
        const updatedAccounts = await Promise.all(
          accounts.map(async (account) => {
            try {
              const info = await AlgorandService.getAccountInfo(account.address);
              const oldInfo = account.info;
              
              // Check for changes and notify
              if (oldInfo) {
                const { hasChanged, changes } = await AlgorandService.compareAccountStates(oldInfo, info);
                if (hasChanged) {
                  changes.forEach(change => {
                    Toast.show({
                      type: 'info',
                      text1: `Account Update: ${account.address.slice(0, 8)}...`,
                      text2: change,
                      visibilityTime: 4000,
                    });
                  });
                }
              }

              return {
                ...account,
                info,
                lastUpdated: Date.now(),
                error: undefined,
              };
            } catch (error) {
              return {
                ...account,
                lastUpdated: Date.now(),
                error: error.message,
              };
            }
          })
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
        return updatedAccounts;
      } catch (error) {
        console.error('Error fetching watched accounts:', error);
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL,
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
      
      Toast.show({
        type: 'success',
        text1: 'Account Added',
        text2: `Now monitoring ${address.slice(0, 8)}...`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error Adding Account',
        text2: error.message,
      });
      throw new Error(`Failed to add account: ${error.message}`);
    }
  };

  const removeAccount = async (address: string) => {
    const newAccounts = accounts.filter(acc => acc.address !== address);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
    queryClient.setQueryData(['watched-accounts'], newAccounts);
    
    Toast.show({
      type: 'info',
      text1: 'Account Removed',
      text2: `Stopped monitoring ${address.slice(0, 8)}...`,
    });
  };

  return {
    accounts,
    isLoading,
    error,
    addAccount,
    removeAccount,
  };
}