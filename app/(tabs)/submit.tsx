import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useOnboardingStore } from '../../src/store/useOnboardingStore';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Video } from 'lucide-react-native';

const TOTAL_STEPS = 6;

export default function SubmitScreen() {
  const [step, setStep] = useState(1);
  const store = useOnboardingStore();

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <TouchableOpacity style={styles.aiFastTrackButton} onPress={() => router.push('/ai-onboard')}>
              <Text style={styles.aiFastTrackTitle}>✨ Try Quick AI Onboarding</Text>
              <Text style={styles.aiFastTrackSub}>Just chat with our agent and it will fill this out for you.</Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR DO IT MANUALLY</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.question}>What type of proposal is this?</Text>
            <View style={styles.optionsGrid}>
              {['event', 'project', 'policy', 'funding', 'working_group', 'campaign'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionCard, store.proposalType === type && styles.optionCardActive]}
                  onPress={() => store.updateTopLevel('proposalType', type)}
                >
                  <Text style={[styles.optionText, store.proposalType === type && styles.optionTextActive]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Why does this matter?</Text>
            <Text style={styles.hint}>Briefly explain the purpose and impact.</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="This proposal will help..."
              value={store.purpose}
              onChangeText={(text) => store.updateTopLevel('purpose', text)}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>What resources do you need?</Text>
            
            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g. 5"
              value={store.resourceNeeds.peopleNeeded}
              onChangeText={(text) => store.updateField('resourceNeeds', 'peopleNeeded', text)}
            />

            <Text style={styles.label}>Required Skills (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. gardening, design"
              value={store.resourceNeeds.skillsNeeded}
              onChangeText={(text) => store.updateField('resourceNeeds', 'skillsNeeded', text)}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Main Park or Zoom"
              value={store.resourceNeeds.location}
              onChangeText={(text) => store.updateField('resourceNeeds', 'location', text)}
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Governance Requirements</Text>
            <Text style={styles.hint}>What minimum support does this need to move forward?</Text>
            
            <Text style={styles.label}>Minimum Consents</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={store.governance.minConsents}
              onChangeText={(text) => store.updateField('governance', 'minConsents', text)}
            />

            <Text style={styles.label}>Minimum Participants</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={store.governance.minParticipants}
              onChangeText={(text) => store.updateField('governance', 'minParticipants', text)}
            />

            <Text style={styles.label}>Minimum Stewards</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={store.governance.minStewards}
              onChangeText={(text) => store.updateField('governance', 'minStewards', text)}
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Timeline</Text>
            <Text style={styles.label}>When should this happen?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Next weekend, Summer 2026"
              value={store.timeline}
              onChangeText={(text) => store.updateTopLevel('timeline', text)}
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Record your pitch</Text>
            <Text style={styles.hint}>A 30-60 second video explains it best.</Text>
            
            <TouchableOpacity style={styles.recordButton} onPress={() => router.push('/camera')}>
              <Video color="#FFF" size={32} />
              <Text style={styles.recordButtonText}>
                {store.videoUri ? 'Re-record Video' : 'Open Camera'}
              </Text>
            </TouchableOpacity>

            {store.videoUri && (
              <Text style={styles.successText}>Video recorded successfully!</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>Step {step} of {TOTAL_STEPS}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity style={styles.navButtonSecondary} onPress={handleBack}>
              <ArrowLeft color="#333" size={24} />
            </TouchableOpacity>
          ) : <View style={{ width: 56 }} />}

          {step < TOTAL_STEPS ? (
            <TouchableOpacity style={styles.navButtonPrimary} onPress={handleNext}>
              <Text style={styles.navButtonPrimaryText}>Next</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButtonPrimary, !store.videoUri && styles.navButtonDisabled]} 
              onPress={() => router.push('/review')}
              disabled={!store.videoUri}
            >
              <Text style={styles.navButtonPrimaryText}>Review & Publish</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8AB8A8', // Sage green
    borderRadius: 3,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  aiFastTrackButton: {
    backgroundColor: '#E5A975',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  aiFastTrackTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiFastTrackSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardActive: {
    borderColor: '#8AB8A8',
    backgroundColor: 'rgba(138, 184, 168, 0.1)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  optionTextActive: {
    color: '#4A6B5D',
  },
  textArea: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  recordButton: {
    backgroundColor: '#E5A975', // Clay orange
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 12,
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#8AB8A8',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
  },
  navButtonSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonPrimary: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8AB8A8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#CCC',
  },
  navButtonPrimaryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
