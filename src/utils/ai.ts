const API_KEY = 'sk-t5eHAY.f527a413f9f4b93ad4d62a17d7488e4a5efec9a687db9399d0a1175103ea61cd';
const API_URL = 'https://api.mor.org/v1/chat/completions';

export interface AIProposalResponse {
  title: string;
  summary: string;
  tags: string[];
}

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Original Step 7 Review Function
export async function generateProposalStructure(
  proposalType: string,
  purpose: string,
  resources: string,
  timeline: string
): Promise<AIProposalResponse> {
  const prompt = `
You are an expert community organizer. I have a draft for a new community proposal.
Please generate a concise, engaging title, a 1-2 sentence summary, and 3-4 short tags that best categorize this proposal.

Details:
- Type: ${proposalType}
- Purpose: ${purpose}
- Resources Needed: ${resources}
- Timeline: ${timeline}

Return ONLY a valid JSON object with the following structure:
{
  "title": "A catchy, short title",
  "summary": "A clear, compelling 1-2 sentence summary",
  "tags": ["Tag1", "Tag2", "Tag3"]
}
`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as AIProposalResponse;
    
  } catch (error) {
    console.error('Failed to generate AI structure:', error);
    return {
      title: `New ${proposalType || 'Community'} Initiative`,
      summary: purpose.slice(0, 100) + (purpose.length > 100 ? '...' : ''),
      tags: [proposalType || 'General', 'Community Generated'],
    };
  }
}

// New: Conversational Agent for Quick Onboarding
export const INITIAL_SYSTEM_PROMPT = `You are a friendly community organizer assistant for CommonsFlow. 
Your goal is to help a user draft a community proposal through a short conversation.
You need to gather the following details:
1. Proposal Type (event, project, policy, funding, working_group, campaign)
2. Purpose (Why does this matter?)
3. Resources Needed (People, Skills, Location)
4. Timeline (When should it happen?)

Ask ONE question at a time. Keep it conversational and encouraging.
If the user provides multiple pieces of information at once, acknowledge them and ask for what's missing.

CRITICAL INSTRUCTION:
Once you have gathered ALL the required details, you must stop asking questions and output ONLY a JSON object representing the final proposal data. 
DO NOT include any conversational text when you output the JSON.
The JSON must perfectly match this structure exactly, using valid string types (numbers as strings is fine):
{
  "COMPLETE": true,
  "proposalType": "project",
  "purpose": "A brief description...",
  "resourceNeeds": {
    "peopleNeeded": "5",
    "skillsNeeded": "gardening, organizing",
    "location": "Central Park"
  },
  "timeline": "Next month"
}

If you do not have all the information yet, just respond normally with your next question. Do not include the word COMPLETE or any JSON structure until you are done.`;

export async function sendChatMessage(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Chat error:', error);
    return "I'm having trouble connecting right now. Could you repeat that?";
  }
}
