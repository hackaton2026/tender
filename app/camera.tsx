import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { ArrowLeft, CircleStop, Video } from 'lucide-react-native';
import { useOnboardingStore } from '../src/store/useOnboardingStore';

export default function CameraScreen() {
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { updateTopLevel } = useOnboardingStore();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRecord = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      if (video) {
        updateTopLevel('videoUri', video.uri);
        router.back();
      }
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode="video">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#FFF" size={28} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}>
              <Text style={styles.text}>Flip</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordingButton]} 
              onPress={handleRecord}
            >
              {isRecording ? <CircleStop color="#FFF" size={40} /> : <Video color="#FFF" size={32} />}
            </TouchableOpacity>
            {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  flipButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.9)', // Soft coral
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  permissionButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#8AB8A8',
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  recordingText: {
    color: '#FFF',
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
