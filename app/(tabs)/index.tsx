import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useWatchedAccounts } from '../../hooks/useWatchedAccounts';
import { Ionicons } from '@expo/vector-icons';

export default function WatchlistScreen() {
  const { accounts, isLoading, removeAccount } = useWatchedAccounts();

  const renderAccount = ({ item }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <Text style={styles.address} numberOfLines={1}>
          {item.address}
        </Text>
        <TouchableOpacity
          onPress={() => removeAccount(item.address)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>
      
      {item.info ? (
        <View style={styles.accountInfo}>
          <Text style={styles.balance}>
            Balance: {(item.info.amount / 1e6).toFixed(6)} ALGO
          </Text>
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
          <Text style={styles.emptyText}>
            No accounts being watched. Add an account to get started!
          </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  accountInfo: {
    marginTop: 8,
  },
  balance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  updatedAt: {
    fontSize: 12,
    color: '#666',
  },
  error: {
    color: '#D32F2F',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
});