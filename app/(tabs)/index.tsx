import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFeedStore } from '../../src/store/useFeedStore';
import ProposalCard from '../../src/components/ProposalCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';

export default function HomeScreen() {
  const { proposals } = useFeedStore();

  if (proposals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more proposals to review!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={proposals}
        renderItem={({ item, index }) => <ProposalCard proposal={item} index={index} />}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F0', // Parchment cream
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
});
