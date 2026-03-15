import { create } from 'zustand';
import { Proposal, Comment } from '../types';
import { supabase } from '../lib/supabase';

interface FeedState {
  proposals: Proposal[];
  comments: Comment[];
  currentIndex: number;
  loading: boolean;
  fetchProposals: () => Promise<void>;
  nextProposal: () => void;
  removeProposal: (id: string) => void;
  addComment: (comment: Comment) => Promise<void>;
  getCommentsForProposal: (proposalId: string) => Comment[];
  fetchComments: (proposalId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  proposals: [],
  comments: [],
  currentIndex: 0,
  loading: false,

  fetchProposals: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // We need to map DB casing to our camelCase types here if they differ
      // For MVP, assuming they closely match or handling it here
      set({ proposals: data || [], currentIndex: 0 });
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      set({ loading: false });
    }
  },

  nextProposal: () => set((state) => ({ 
    currentIndex: Math.min(state.currentIndex + 1, state.proposals.length - 1) 
  })),

  removeProposal: (id) => set((state) => {
    const newProposals = state.proposals.filter(p => p.id !== id);
    const newIndex = Math.min(state.currentIndex, Math.max(0, newProposals.length - 1));
    return { proposals: newProposals, currentIndex: newIndex };
  }),

  fetchComments: async (proposalId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Merge fetched comments, avoiding duplicates
      set((state) => {
        const existingIds = state.comments.map(c => c.id);
        const newComments = (data || []).filter(c => !existingIds.includes(c.id));
        return { comments: [...state.comments, ...newComments] };
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  },

  addComment: async (comment) => {
    // Optimistic update
    set((state) => ({ comments: [...state.comments, comment] }));
    
    // DB update
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: comment.userId,
          proposal_id: comment.proposalId,
          content: comment.content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error inserting comment:', error);
      // Revert optimistic update on failure
      set((state) => ({ comments: state.comments.filter(c => c.id !== comment.id) }));
    }
  },

  getCommentsForProposal: (proposalId) => {
    // We map 'proposal_id' to 'proposalId' dynamically if we don't transform everything
    return get().comments.filter(c => c.proposalId === proposalId || (c as any).proposal_id === proposalId);
  },
}));
