import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../src/store/useOnboardingStore';
import { useFeedStore } from '../src/store/useFeedStore';
import { supabase } from '../src/lib/supabase';
import { generateProposalStructure, AIProposalResponse } from '../src/utils/ai';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function ReviewScreen() {
  const store = useOnboardingStore();
  const { fetchProposals } = useFeedStore();
  
  const [aiData, setAiData] = useState<AIProposalResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function fetchAI() {
      setLoadingAI(true);
      
      const resourcesString = `People: ${store.resourceNeeds.peopleNeeded}, Skills: ${store.resourceNeeds.skillsNeeded}`;
      
      const result = await generateProposalStructure(
        store.proposalType,
        store.purpose,
        resourcesString,
        store.timeline
      );
      
      setAiData(result);
      setLoadingAI(false);
    }
    
    fetchAI();
  }, []);

  const handlePublish = async () => {
    if (!aiData) return;
    setPublishing(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    // Fallback if not logged in (e.g. testing mode)
    const creatorId = session?.user?.id || 'mock-user-id';

    const { error } = await supabase.from('proposals').insert({
      creator_id: creatorId,
      title: aiData.title,
      summary: aiData.summary,
      description: store.purpose,
      video_url: store.videoUri || 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      tags: aiData.tags,
      type: store.proposalType || 'project',
      resource_needs: {
        peopleNeeded: parseInt(store.resourceNeeds.peopleNeeded) || 0,
        skillsNeeded: store.resourceNeeds.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean),
        location: store.resourceNeeds.location,
        timeCommitment: store.timeline,
      },
      thresholds: {
        minConsents: parseInt(store.governance.minConsents) || 10,
        minParticipants: parseInt(store.governance.minParticipants) || 3,
        minStewards: parseInt(store.governance.minStewards) || 1,
      },
      status: 'in_review',
    });

    if (error && session) {
      alert(error.message);
      setPublishing(false);
      return;
    }

    // Refresh feed
    await fetchProposals();

    setPublishing(false);
    store.reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Publish</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.aiBox}>
          <Text style={styles.aiBoxTitle}>✨ AI Generated Structure</Text>
          <Text style={styles.aiBoxText}>Based on your pitch, Morpheus AI has formatted how your proposal will appear to the community.</Text>
        </View>

        {loadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8AB8A8" />
            <Text style={styles.loadingText}>Structuring your proposal...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{aiData?.title}</Text>

            <Text style={styles.label}>Summary</Text>
            <Text style={styles.value}>{aiData?.summary}</Text>

            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {aiData?.tags.map((tag, i) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Resources Requested</Text>
          <Text style={styles.value}>• {store.resourceNeeds.peopleNeeded || '0'} Volunteers</Text>
          {store.resourceNeeds.skillsNeeded && (
            <Text style={styles.value}>• Skills: {store.resourceNeeds.skillsNeeded}</Text>
          )}
          <Text style={styles.value}>• Location: {store.resourceNeeds.location || 'TBD'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Governance Thresholds</Text>
          <Text style={styles.value}>Consents Needed: {store.governance.minConsents}</Text>
          <Text style={styles.value}>Participants Needed: {store.governance.minParticipants}</Text>
          <Text style={styles.value}>Stewards Needed: {store.governance.minStewards}</Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.publishButton, (loadingAI || publishing) && styles.publishButtonDisabled]} 
          onPress={handlePublish}
          disabled={loadingAI || publishing}
        >
          {publishing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <CheckCircle color="#FFF" size={24} />
              <Text style={styles.publishButtonText}>Publish to Feed</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  aiBox: {
    backgroundColor: 'rgba(138, 184, 168, 0.15)', // Light Sage
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8AB8A8',
  },
  aiBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6B5D',
    marginBottom: 8,
  },
  aiBoxText: {
    color: '#555',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  publishButton: {
    flexDirection: 'row',
    backgroundColor: '#8AB8A8', // Sage green
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  publishButtonDisabled: {
    backgroundColor: '#A9C7BC',
  },
  publishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
