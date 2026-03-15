import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';
import { useFeedStore } from '../../src/store/useFeedStore';
import { Proposal } from '../../src/types';
import { Activity, Users, MapPin, Calendar } from 'lucide-react-native';

export default function OngoingScreen() {
  // For the MVP, let's assume the user is part of all proposals that they have submitted
  // or that are in our mock feed to simulate "Ongoing" involvement.
  const { proposals } = useFeedStore();

  const renderOngoingCard = ({ item }: { item: Proposal }) => {
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/proposal/${item.id}`)}
      >
        <Image 
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop' }} 
          style={styles.cardImage} 
        />
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>{item.proposalType}</Text>
            </View>
            <View style={[
              styles.statusTag, 
              item.status === 'seeking_participants' ? styles.statusWarning : styles.statusProgress
            ]}>
              <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
          
          <View style={styles.detailsRow}>
            {item.resourceNeeds.location && (
              <View style={styles.detailItem}>
                <MapPin size={14} color="#666" />
                <Text style={styles.detailText}>{item.resourceNeeds.location}</Text>
              </View>
            )}
            {item.resourceNeeds.timeCommitment && (
              <View style={styles.detailItem}>
                <Calendar size={14} color="#666" />
                <Text style={styles.detailText}>{item.resourceNeeds.timeCommitment}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Support</Text>
              <Text style={styles.progressValue}>
                0 / {item.thresholds.minConsents}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '10%' }]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ongoing Library</Text>
        <Text style={styles.headerSubtitle}>Proposals you've joined or steward</Text>
      </View>

      <FlatList
        data={proposals}
        keyExtractor={(item) => item.id}
        renderItem={renderOngoingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F0', // Parchment cream
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // For tab bar
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#DDD',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeTag: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusWarning: {
    backgroundColor: 'rgba(229, 169, 117, 0.2)', // Clay orange
  },
  statusProgress: {
    backgroundColor: 'rgba(138, 184, 168, 0.2)', // Sage green
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  progressSection: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8AB8A8',
    borderRadius: 3,
  },
});
