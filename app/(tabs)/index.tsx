import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useWatchedAccounts } from '../../hooks/useWatchedAccounts';
import { Ionicons } from '@expo/vector-icons';
import { AlgorandService } from '../../services/algorand';
import { AssetInfo } from '../../types/account';

const AssetCard = ({ asset }: { asset: AssetInfo }) => (
  <View style={styles.assetCard}>
    <View style={styles.assetHeader}>
      <View style={styles.assetIcon}>
        {asset.url ? (
          <Image source={{ uri: asset.url }} style={styles.assetImage} />
        ) : (
          <Ionicons name="cube-outline" size={24} color="#666" />
        )}
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetUnit}>{asset.unitName}</Text>
      </View>
      <View style={styles.assetBalance}>
        <Text style={styles.balanceText}>
          {AlgorandService.formatAssetBalance(asset.amount, asset.decimals)}
        </Text>
        <Text style={styles.assetStatus}>
          {asset.frozen ? 'Frozen' : 'Active'}
        </Text>
      </View>
    </View>
  </View>
);

export default function WatchlistScreen() {
  const { accounts, isLoading, removeAccount } = useWatchedAccounts();

  const renderAccount = ({ item }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.addressContainer}>
          <Ionicons name="wallet-outline" size={24} color="#2196F3" />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeAccount(item.address)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>
      
      {item.info ? (
        <View style={styles.accountInfo}>
          <View style={styles.mainBalance}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balance}>
              {AlgorandService.formatAlgoBalance(item.info.amount)} ALGO
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending Rewards</Text>
              <Text style={styles.statValue}>
                {AlgorandService.formatAlgoBalance(item.info['pending-rewards'])} ALGO
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min Balance</Text>
              <Text style={styles.statValue}>
                {AlgorandService.formatAlgoBalance(item.info['min-balance'])} ALGO
              </Text>
            </View>
          </View>

          {item.info.assets && item.info.assets.length > 0 && (
            <View style={styles.assetsContainer}>
              <Text style={styles.assetsTitle}>Assets</Text>
              <FlatList
                data={item.info.assets}
                renderItem={({ item }) => <AssetCard asset={item} />}
                keyExtractor={asset => `${asset.id}`}
                scrollEnabled={false}
              />
            </View>
          )}

          <Text style={styles.updatedAt}>
            Last updated: {new Date(item.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      ) : (
        <Text style={styles.error}>{item.error || 'Failed to load account info'}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watched Accounts</Text>
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={item => item.address}
        refreshControl={
          <RefreshControl refreshing={isLoading} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>
              No accounts being watched. Add an account to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 40,
    color: '#1a1a1a',
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  accountInfo: {
    gap: 16,
  },
  mainBalance: {
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  assetsContainer: {
    marginTop: 16,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  assetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  assetUnit: {
    fontSize: 12,
    color: '#666',
  },
  assetBalance: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  assetStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  updatedAt: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  error: {
    color: '#D32F2F',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
});