export type User = {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  skills?: string[]
  groups?: string[]
  reputationScore?: number
  createdAt: string
}

export type Proposal = {
  id: string
  creatorId: string
  title: string
  summary: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  tags: string[]
  proposalType: "event" | "project" | "policy" | "funding" | "working_group" | "campaign"
  resourceNeeds: {
    fundingNeeded?: number
    peopleNeeded?: number
    skillsNeeded?: string[]
    materialsNeeded?: string[]
    location?: string
    timeCommitment?: string
  }
  thresholds: {
    minConsents?: number
    minConsentRatio?: number
    minParticipants?: number
    minStewards?: number
    maxObjectionRatio?: number
  }
  status:
    | "draft"
    | "submitted"
    | "in_review"
    | "approved"
    | "seeking_participants"
    | "seeking_steward"
    | "ready_to_start"
    | "in_progress"
    | "completed"
    | "rejected"
    | "needs_revision"
    | "expired"
  deadline?: string
  createdAt: string
}

export type Decision = {
  id: string
  userId: string
  proposalId: string
  decisionType: "object" | "consent" | "participate" | "steward" | "need_more_info"
  createdAt: string
}

export type Participation = {
  id: string
  userId: string
  proposalId: string
  role?: string
  status: "interested" | "confirmed" | "withdrawn"
  createdAt: string
}

export type Stewardship = {
  id: string
  userId: string
  proposalId: string
  status: "pending" | "accepted" | "withdrawn"
  createdAt: string
}

export type Comment = {
  id: string
  userId: string
  proposalId: string
  content: string
  createdAt: string
}
