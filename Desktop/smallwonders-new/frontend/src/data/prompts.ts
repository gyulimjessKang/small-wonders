export interface Prompt {
  id: string;
  text: string;
  category: string;
  description?: string;
}

export const prompts: Prompt[] = [
  // Curated prompts to encourage noticing small joys in the mundane

  //Nature prompts
{
    id: 'custom-1',
    text: "If you had to describe today’s sky at a strange hour (like dawn or midnight), how would you?",
    category: 'Nature',
    description: 'Observing sky at unusual times'
  },
  {
    id: 'custom-2',
    text: "Choose a nearby plant and watch it for 5 minutes—what do you notice?",
    category: 'Nature',
    description: 'Plant observation and awareness'
  },
  {
    id: 'custom-3',
    text: "Watch light filter through tree leaves. What shapes or shadows appear?",
    category: 'Nature',
    description: 'Light and shadow in nature'
  },
  {
    id: 'custom-4',
    text: "Observe a bird or squirrel for a few minutes—what choices does it seem to make?",
    category: 'Nature',
    description: 'Animal behavior and patterns'
  },
  {
    id: 'custom-5',
    text: "Touch a tree—what does it feel or sound like?",
    category: 'Nature',
    description: 'Sensory exploration of trees'
  },
  //People prompts
  {
    id: 'custom-6',
    text: "Take a walk and find five things you’ve never noticed before.",
    category: 'People',
    description: 'Noticing details in familiar places'
  },
  {
    id: 'custom-7',
    text: "Look at the windows in houses around you—what might they say about the people inside?",
    category: 'People',
    description: 'Inferring lives from surroundings'
  },
  {
    id: 'custom-8',
    text: "What do objects left on porches tell you about their owners?",
    category: 'People',
    description: 'Stories from ordinary objects'
  },
  {
    id: 'custom-9',
    text: "Watch how people cross the street. What can you learn from their body language?",
    category: 'People',
    description: 'Micro-behaviors of people in transit'
  },
  {
    id: 'custom-10',
    text: "Study a utility pole or lamppost—what’s stuck or scribbled on it?",
    category: 'People',
    description: 'Street-level communication and marks'
  },
  {
    id: 'custom-11',
    text: "Ask someone what made them smile today. How did they tell the story?",
    category: 'People',
    description: 'Secondhand joy and storytelling'
  },
  {
    id: 'custom-12',
    text: "Watch someone do a task they know well. What’s beautiful about their rhythm?",
    category: 'People',
    description: 'Joy in skilled everyday motions'
  },
  {
    id: 'custom-13',
    text: "Sit in silence with someone. Afterwards, share what you noticed.",
    category: 'People',
    description: 'Shared silence and perspective'
  },
  {
    id: 'custom-14',
    text: "Take a photo of a family object. What stories does it hold?",
    category: 'People',
    description: 'Memory in everyday heirlooms'
  },
  //Learning prompts
  {
    id: 'custom-15',
    text: "Choose one item on your desk and look at it like it’s brand new.",
    category: 'Learning',
    description: 'Rediscovering everyday objects'
  },
  {
    id: 'custom-16',
    text: "Pull a random item from your junk drawer. What’s its story?",
    category: 'Learning',
    description: 'Curious reflection on forgotten tools'
  },
  {
    id: 'custom-17',
    text: "Watch your hands while doing something routine—what do they know?",
    category: 'Learning',
    description: 'Muscle memory and movement'
  },
  {
    id: 'custom-18',
    text: "Follow your shadow at different times. How does it move or stretch?",
    category: 'Learning',
    description: 'Noticing the day through shadow'
  },
  //Art prompts
  {
    id: 'custom-19',
    text: "Collect a few natural objects—leaves, pebbles—and arrange them into a shape. What story could they tell?",
    category: 'Art',
    description: 'Imaginative play with found objects'
  },
  {
    id: 'custom-20',
    text: "Make up a name for a tree or bird you don’t know. Why that name?",
    category: 'Art',
    description: 'Creative naming and observation'
  },
  {
    id: 'custom-21',
    text: "Watch water in any form—faucet, puddle, glass. What do you see?",
    category: 'Art',
    description: 'Visual exploration of water'
  },
  {
    id: 'custom-22',
    text: "If you had to represent a moment from today in color or sound, how would you do it?",
    category: 'Art',
    description: 'Sensory translation of experience'
  }, 
  //Food prompts
{
    id: 'custom-food-1',
    text: "What was the texture of the most interesting thing you ate today?",
    category: 'Food',
    description: 'Explores tactile awareness of food'
  },
  {
    id: 'custom-food-2',
    text: "Did a scent from food today trigger a memory?",
    category: 'Food',
    description: 'Connects smell to past experiences'
  },
  {
    id: 'custom-food-3',
    text: "Who did you think of while eating today, and why?",
    category: 'Food',
    description: 'Food as a portal to relationships or nostalgia'
  },
  {
    id: 'custom-food-4',
    text: "What colors showed up in your meal today?",
    category: 'Food',
    description: 'Encourages mindful eating through color awareness'
  },
  {
    id: 'custom-food-5',
    text: "Did you prepare or plate something with care today? What made it feel intentional?",
    category: 'Food',
    description: 'Invites reflection on routine acts made beautiful'
  },
  
  //Music prompts
  {
    id: 'custom-music-1',
    text: "Where did music find you today—on purpose or by surprise?",
    category: 'Music',
    description: 'Spotting unplanned musical encounters'
  },
  {
    id: 'custom-music-2',
    text: "What moment today felt like it had a soundtrack?",
    category: 'Music',
    description: 'Imagining a cinematic layer to daily life'
  },
  {
    id: 'custom-music-3',
    text: "Did you notice any repeating rhythm in your day—even outside of music?",
    category: 'Music',
    description: 'Encourages musical thinking in non-musical moments'
  },
  {
    id: 'custom-music-4',
    text: "How did a lyric or melody echo your mood today?",
    category: 'Music',
    description: 'Draws emotional parallels between life and sound'
  },
  {
    id: 'custom-music-5',
    text: "What was the most beautiful silence you experienced today?",
    category: 'Music',
    description: 'Appreciation for musical absence or stillness'
  },
  
  //Color prompts
  {
    id: 'custom-color-1',
    text: "What unexpected place did you notice a beautiful color today?",
    category: 'Color',
    description: 'Brings awareness to overlooked vibrancy'
  },
  {
    id: 'custom-color-2',
    text: "Which color best represents your day? Why?",
    category: 'Color',
    description: 'Invites metaphorical thinking'
  },
  {
    id: 'custom-color-3',
    text: "Did you notice a color changing with the light or time of day?",
    category: 'Color',
    description: 'Focuses on subtle, shifting perception'
  },
  {
    id: 'custom-color-4',
    text: "What clashing or harmonious color combination caught your eye?",
    category: 'Color',
    description: 'Encourages exploration of visual tension or flow'
  },
  {
    id: 'custom-color-5',
    text: "Did a color today remind you of a person, place, or moment?",
    category: 'Color',
    description: 'Color as memory trigger'
  },
  
  //Technology prompts
  {
    id: 'custom-tech-1',
    text: "What was the kindest thing technology did for you today?",
    category: 'Technology',
    description: 'Humanizing our tech interactions'
  },
  {
    id: 'custom-tech-2',
    text: "What moment today made you grateful for being offline?",
    category: 'Technology',
    description: 'Reflects on presence and disconnection'
  },
  {
    id: 'custom-tech-3',
    text: "Did you learn something through technology that sparked wonder?",
    category: 'Technology',
    description: 'Celebrating curiosity enabled by tools'
  },
  {
    id: 'custom-tech-4',
    text: "What small technical design detail brought you joy or ease today?",
    category: 'Technology',
    description: 'Appreciating UX in daily life'
  },
  {
    id: 'custom-tech-5',
    text: "Was there a glitch or hiccup in your tech use today that made you laugh or pause?",
    category: 'Technology',
    description: 'Finding delight or perspective in imperfection'
  },
  
  //Movement prompts
  {
    id: 'custom-movement-1',
    text: "What was the most satisfying movement your body made today?",
    category: 'Movement',
    description: 'Focuses on physical joy or release'
  },
  {
    id: 'custom-movement-2',
    text: "How did you move through space differently today—slower, faster, lighter?",
    category: 'Movement',
    description: 'Mindfulness of pace and posture'
  },
  {
    id: 'custom-movement-3',
    text: "Did your movement mirror someone else’s—walking beside a friend, dancing with a stranger?",
    category: 'Movement',
    description: 'Invites attention to social motion'
  },
  {
    id: 'custom-movement-4',
    text: "What natural rhythm did your body follow today?",
    category: 'Movement',
    description: 'Body as an instrument of rhythm and flow'
  },
  {
    id: 'custom-movement-5',
    text: "Was there a moment where stillness felt like movement?",
    category: 'Movement',
    description: 'Contemplating internal or metaphorical motion'
  }  
];

export const categories = [
  'Nature',
  'People', 
  'Food',
  'Music',
  'Color',
  'Technology',
  'Movement',
  'Learning',
  'Art'
];

export function getPromptsByCategory(category: string): Prompt[] {
  return prompts.filter(prompt => prompt.category === category);
}

export function getAllCategories(): string[] {
  return categories;
} 