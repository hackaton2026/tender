import { Proposal, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    bio: 'Community organizer and local gardener.',
    skills: ['gardening', 'organizing', 'fundraising'],
    groups: ['Local Greens', 'City Council'],
    reputationScore: 85,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    bio: 'Tech enthusiast looking to help out.',
    skills: ['programming', 'design', 'writing'],
    reputationScore: 42,
    createdAt: new Date().toISOString(),
  }
];

export const mockProposals: Proposal[] = [
  {
    id: 'p1',
    creatorId: 'u1',
    title: 'Community Garden Revitalization',
    summary: 'Let us clean up the old garden on 5th street and plant new vegetables.',
    description: 'The community garden has been neglected for years. We need volunteers to help clear the weeds, fix the raised beds, and plant new seeds for the spring season. This will provide fresh food for local families and create a beautiful green space.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2000&auto=format&fit=crop',
    tags: ['Local Initiative', 'Environment', 'Food'],
    proposalType: 'project',
    resourceNeeds: {
      fundingNeeded: 500,
      peopleNeeded: 15,
      skillsNeeded: ['gardening', 'carpentry'],
      materialsNeeded: ['seeds', 'soil', 'tools', 'wood'],
      location: '5th Street Garden',
      timeCommitment: '1 weekend',
    },
    thresholds: {
      minConsents: 50,
      minParticipants: 10,
      minStewards: 2,
    },
    status: 'seeking_participants',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    creatorId: 'u2',
    title: 'Weekly Tech Mentorship',
    summary: 'Starting a weekly coding workshop for local high school students.',
    description: 'I want to organize a weekly meetup at the community center where local software engineers can mentor high school students in programming and web development. We need volunteers willing to commit 2 hours a week.',
    videoUrl: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop',
    tags: ['Education', 'Tech', 'Youth'],
    proposalType: 'event',
    resourceNeeds: {
      peopleNeeded: 5,
      skillsNeeded: ['programming', 'teaching'],
      location: 'Main Community Center',
      timeCommitment: '2 hours/week',
    },
    thresholds: {
      minConsents: 20,
      minParticipants: 3,
      minStewards: 1,
    },
    status: 'in_review',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
