import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Proposal } from '../types';
import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { useFeedStore } from '../store/useFeedStore';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { router } from 'expo-router';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = WINDOW_WIDTH * 0.3;

interface Props {
  proposal: Proposal;
  index: number;
}

export default function ProposalCard({ proposal, index }: Props) {
  const { currentIndex, removeProposal } = useFeedStore();
  const isActive = currentIndex === index;

  const player = useVideoPlayer(proposal.videoUrl, (player: VideoPlayer) => {
    player.loop = true;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleDecision = (decision: 'consent' | 'object') => {
    removeProposal(proposal.id);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swiped Right - Consent
        translateX.value = withSpring(WINDOW_WIDTH * 1.5, {}, () => {
          runOnJS(handleDecision)('consent');
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swiped Left - Object
        translateX.value = withSpring(-WINDOW_WIDTH * 1.5, {}, () => {
          runOnJS(handleDecision)('object');
        });
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 20}deg` },
    ],
  }));

  const handleConsent = () => {
    translateX.value = withSpring(WINDOW_WIDTH * 1.5, {}, () => {
      runOnJS(handleDecision)('consent');
    });
  };

  const handleObject = () => {
    translateX.value = withSpring(-WINDOW_WIDTH * 1.5, {}, () => {
      runOnJS(handleDecision)('object');
    });
  };

  const handleOpenDetails = () => {
    router.push(`/proposal/${proposal.id}`);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Video Background */}
        <VideoView 
          style={styles.video} 
          player={player} 
          nativeControls={false}
        />

        {/* Dark overlay for readability */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header Tags */}
          <View style={styles.tagsContainer}>
            {proposal.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            <View style={[styles.tag, styles.needsTag]}>
              <Text style={styles.needsTagText}>Needs {proposal.resourceNeeds.peopleNeeded} Vols</Text>
            </View>
          </View>

          {/* Text Info */}
          <TouchableOpacity style={styles.infoContainer} onPress={handleOpenDetails} activeOpacity={0.8}>
            <Text style={styles.title}>{proposal.title}</Text>
            <Text style={styles.summary}>{proposal.summary}</Text>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {proposal.thresholds.minConsents ? `0 / ${proposal.thresholds.minConsents} consents` : '0 consents'}
              </Text>
              <Text style={styles.progressText}>
                {proposal.thresholds.minParticipants ? `0 / ${proposal.thresholds.minParticipants} participants` : '0 participants'}
              </Text>
              <Text style={styles.progressText}>
                {proposal.thresholds.minStewards ? `0 / ${proposal.thresholds.minStewards} stewards` : '0 stewards'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action Buttons (Replace with swiping later) */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={[styles.actionButton, styles.declineBtn]} onPress={handleObject}>
              <ThumbsDown color="#FFF" size={24} />
              <Text style={styles.actionBtnText}>Object</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.consentBtn]} onPress={handleConsent}>
              <ThumbsUp color="#FFF" size={24} />
              <Text style={styles.actionBtnText}>Consent</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 100, // Account for tab bar
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  needsTag: {
    backgroundColor: 'rgba(255,165,0,0.8)', // Clay orange
  },
  needsTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#DDD',
    marginBottom: 16,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  declineBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)', // Soft coral
  },
  consentBtn: {
    backgroundColor: 'rgba(138, 184, 168, 0.9)', // Sage green
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
