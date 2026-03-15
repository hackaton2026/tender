import { create } from 'zustand';

interface OnboardingState {
  proposalType: string;
  purpose: string;
  resourceNeeds: {
    fundingNeeded: string;
    peopleNeeded: string;
    skillsNeeded: string;
    location: string;
    timeCommitment: string;
  };
  governance: {
    minConsents: string;
    minParticipants: string;
    minStewards: string;
  };
  timeline: string;
  videoUri: string | null;
  updateField: (step: keyof OnboardingState, field: string, value: any) => void;
  updateTopLevel: (field: string, value: any) => void;
  reset: () => void;
}

const initialState = {
  proposalType: '',
  purpose: '',
  resourceNeeds: {
    fundingNeeded: '',
    peopleNeeded: '',
    skillsNeeded: '',
    location: '',
    timeCommitment: '',
  },
  governance: {
    minConsents: '10',
    minParticipants: '3',
    minStewards: '1',
  },
  timeline: '',
  videoUri: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  updateField: (step, field, value) => set((state) => ({
    ...state,
    [step]: {
      ...(state[step] as object),
      [field]: value,
    }
  })),
  updateTopLevel: (field, value) => set((state) => ({
    ...state,
    [field]: value,
  })),
  reset: () => set(initialState),
}));
