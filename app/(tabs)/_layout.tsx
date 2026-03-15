import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Home, PlusCircle, Activity } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'Submit',
          tabBarIcon: ({ color }) => <PlusCircle size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ongoing"
        options={{
          title: 'Ongoing',
          tabBarIcon: ({ color }) => <Activity size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
