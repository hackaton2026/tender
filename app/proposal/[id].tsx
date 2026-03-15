import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFeedStore } from '../../src/store/useFeedStore';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ArrowLeft, Users, CheckCircle, Shield, Send } from 'lucide-react-native';
import { mockUsers } from '../../src/data/mock';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams();
  const { proposals, getCommentsForProposal, addComment } = useFeedStore();
  const proposal = proposals.find(p => p.id === id);
  const comments = getCommentsForProposal(id as string);
  const [newComment, setNewComment] = useState('');

  if (!proposal) {
    return (
      <View style={styles.errorContainer}>
        <Text>Proposal not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  const player = useVideoPlayer(proposal.videoUrl, player => {
    player.loop = true;
    player.pause(); // User can play it manually if they want, or we can autoplay
  });

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    addComment({
      id: `c${Date.now()}`,
      userId: 'u1', // mock current user
      proposalId: proposal.id,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    });
    setNewComment('');
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0} // Adjust this based on your header height if needed
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proposal Details</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Video Replay */}
        <View style={styles.videoContainer}>
          <VideoView 
            style={styles.video} 
            player={player} 
            nativeControls={true}
          />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{proposal.title}</Text>
          
          <View style={styles.tagsContainer}>
            {proposal.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Why it matters</Text>
          <Text style={styles.description}>{proposal.description}</Text>
          
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{proposal.resourceNeeds.location || 'TBD'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timeline:</Text>
            <Text style={styles.detailValue}>{proposal.resourceNeeds.timeCommitment || 'TBD'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Resource Needs</Text>
          {proposal.resourceNeeds.peopleNeeded && (
            <View style={styles.resourceRow}>
              <Users size={20} color="#666" />
              <Text style={styles.resourceText}>{proposal.resourceNeeds.peopleNeeded} Volunteers Needed</Text>
            </View>
          )}
          {proposal.resourceNeeds.skillsNeeded && (
            <Text style={styles.resourceSubText}>Skills: {proposal.resourceNeeds.skillsNeeded.join(', ')}</Text>
          )}

          <Text style={styles.sectionTitle}>Threshold Requirements</Text>
          <View style={styles.thresholdRow}>
            <CheckCircle size={20} color="#666" />
            <Text style={styles.thresholdText}>Min Consents: {proposal.thresholds.minConsents || 0}</Text>
          </View>
          <View style={styles.thresholdRow}>
            <Users size={20} color="#666" />
            <Text style={styles.thresholdText}>Min Participants: {proposal.thresholds.minParticipants || 0}</Text>
          </View>
          <View style={styles.thresholdRow}>
            <Shield size={20} color="#666" />
            <Text style={styles.thresholdText}>Min Stewards: {proposal.thresholds.minStewards || 0}</Text>
          </View>

          {/* Comments Section */}
          <Text style={styles.sectionTitle}>Questions & Comments</Text>
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No questions yet. Be the first to ask!</Text>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{getUserName(comment.userId)}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Ask a question or comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]} 
          onPress={handleSendComment}
          disabled={!newComment.trim()}
        >
          <Send size={20} color={newComment.trim() ? "#FFF" : "#A0A0A0"} />
        </TouchableOpacity>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join as Participant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stewardButton}>
          <Text style={styles.stewardButtonText}>Become Steward</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0', // Parchment cream
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180, // Space for comment input and action footer
  },
  videoContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_WIDTH * 1.5, // slightly tall
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  infoSection: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: 'rgba(138, 184, 168, 0.2)', // Light sage
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#4A6B5D',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontWeight: '600',
    width: 80,
    color: '#555',
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resourceSubText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
    marginBottom: 12,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  thresholdText: {
    fontSize: 16,
    color: '#333',
  },
  // Comments styles
  noCommentsText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  commentsList: {
    marginTop: 8,
    gap: 16,
  },
  commentItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontSize: 14,
  },
  commentContent: {
    color: '#555',
    fontSize: 15,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    position: 'absolute',
    bottom: 84, // Above the footer
    left: 0,
    right: 0,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8AB8A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#8AB8A8', // Sage green
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stewardButton: {
    flex: 1,
    backgroundColor: '#E5A975', // Clay orange
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  stewardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
