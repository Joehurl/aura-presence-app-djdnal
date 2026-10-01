export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPro: boolean;
  summary: string;
  content: string;
  checkpointQuestion: string;
  checkpointOptions: string[];
  checkpointAnswer: number;
}

export interface Pillar {
  id: number;
  name: string;
  color: string;
  mutedColor: string;
  lessons: Lesson[];
}

export const PILLARS: Pillar[] = [
  {
    id: 1,
    name: 'Inner State & Grounding',
    color: '#10B981',
    mutedColor: 'rgba(16,185,129,0.12)',
    lessons: [
      {
        id: '1-1',
        title: 'The Non-Needy Mindset',
        duration: '3 min',
        isPro: false,
        summary: 'Neediness repels. Learn to detach from outcomes while staying fully present.',
        content: `Neediness is the silent killer of presence. It shows up not as desperation, but as a subtle hunger — a constant monitoring of how others are responding to you. Are they laughing? Do they like me? Am I coming across well? This internal surveillance pulls you out of the moment and into your own head, and people feel it.\n\nThe antidote isn't indifference. It's abundance. When you genuinely believe that your value doesn't depend on any single interaction, conversation, or person's approval, you become magnetic. You stop performing and start being. You can be warm, engaged, and fully present — without needing anything back.\n\nPractice this: before your next social interaction, remind yourself that you are complete as you are. You're not there to win approval. You're there to connect, to give, to experience. Let the outcome be whatever it is. This single shift — from seeking to giving — transforms how you show up in every room.`,
        checkpointQuestion: 'You tell a joke and nobody laughs. What does a non-needy person do?',
        checkpointOptions: [
          'Explain the joke or apologize to ease the tension',
          'Smile, stay relaxed, and move the conversation forward',
          'Go quiet and avoid speaking for a while',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '1-2',
        title: 'Breathwork for Calm Confidence',
        duration: '4 min',
        isPro: true,
        summary: 'A 4-7-8 breathing pattern that resets your nervous system in 60 seconds.',
        content: `Your breath is the fastest lever you have over your nervous system. When you're anxious, your breathing becomes shallow and rapid — which signals danger to your brain and amplifies the anxiety. The good news: you can reverse this cycle in under 60 seconds.\n\nThe 4-7-8 technique works by activating your parasympathetic nervous system — the "rest and digest" mode that counteracts the fight-or-flight response. Inhale through your nose for 4 counts. Hold for 7 counts. Exhale slowly through your mouth for 8 counts. The extended exhale is the key — it's what triggers the calming response.\n\nDo this three times before any high-stakes interaction: a date, a job interview, a difficult conversation. You'll notice your shoulders drop, your jaw unclenches, and your voice deepens slightly. You're not suppressing your nerves — you're metabolizing them. The energy is still there, but now it's fuel rather than static.`,
        checkpointQuestion: 'In the 4-7-8 technique, which phase is most responsible for the calming effect?',
        checkpointOptions: [
          'The 4-count inhale through the nose',
          'The 7-count breath hold',
          'The 8-count slow exhale',
        ],
        checkpointAnswer: 2,
      },
      {
        id: '1-3',
        title: 'Warm Eye Contact Mastery',
        duration: '3 min',
        isPro: true,
        summary: 'The difference between intense staring and warm, magnetic eye contact.',
        content: `Most people either avoid eye contact out of anxiety or hold it too rigidly in an attempt to seem confident. Both extremes create discomfort. The goal is warm, relaxed eye contact — the kind that says "I see you and I'm comfortable here."\n\nThe secret is softness. Relax the muscles around your eyes. Think of something you genuinely appreciate about the person you're talking to. Your eyes will naturally soften, and that warmth is palpable. It's the difference between a stare and a gaze.\n\nA practical rule: maintain eye contact about 70% of the time while listening, and slightly less while speaking. When you break contact, look to the side — not down (which signals submission) and not up (which signals disengagement). Practice this in low-stakes interactions first: with baristas, cashiers, colleagues. Build the muscle before you need it.`,
        checkpointQuestion: 'When breaking eye contact during conversation, where should you look?',
        checkpointOptions: [
          'Down, to show humility and respect',
          'Up, to signal you\'re thinking',
          'To the side, to maintain a grounded, relaxed presence',
        ],
        checkpointAnswer: 2,
      },
      {
        id: '1-4',
        title: 'Emotional Regulation Under Pressure',
        duration: '5 min',
        isPro: true,
        summary: 'Stay grounded when conversations get uncomfortable or high-stakes.',
        content: `High-pressure moments — conflict, criticism, rejection, high stakes — trigger a predictable physiological response: heart rate spikes, thinking narrows, and the urge to react (fight, flee, or freeze) takes over. The person who can stay grounded in these moments has an enormous advantage.\n\nThe first skill is the pause. When you feel the emotional charge rising, don't react immediately. Take one slow breath. This isn't weakness — it's mastery. The pause creates space between stimulus and response, and in that space lives your power.\n\nThe second skill is labeling. Research by neuroscientist Matthew Lieberman shows that naming an emotion ("I'm feeling defensive right now") reduces its intensity by activating the prefrontal cortex and dampening the amygdala. You don't have to say it out loud — just notice it internally. The third skill is reframing: instead of "this person is attacking me," try "this person is struggling and expressing it poorly." Compassion is a grounding force.`,
        checkpointQuestion: 'Someone criticizes you harshly in a meeting. What is the most grounded first response?',
        checkpointOptions: [
          'Immediately defend yourself to protect your reputation',
          'Take a slow breath, pause, and respond from a calm place',
          'Stay silent and avoid the topic for the rest of the meeting',
        ],
        checkpointAnswer: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Body Language & Demeanor',
    color: '#6366F1',
    mutedColor: 'rgba(99,102,241,0.12)',
    lessons: [
      {
        id: '2-1',
        title: 'The Open Posture Reset',
        duration: '3 min',
        isPro: false,
        summary: 'One posture shift that instantly signals confidence and openness.',
        content: `Your body broadcasts your internal state before you say a word. Crossed arms, hunched shoulders, and a collapsed chest signal defensiveness and low confidence — not just to others, but to your own nervous system. Research by Amy Cuddy and others suggests that expansive postures can actually shift your hormonal state, increasing testosterone and decreasing cortisol.\n\nThe open posture reset is simple: feet shoulder-width apart, weight evenly distributed, shoulders back and down (not forced — just released), chest open, chin level. This isn't about puffing up. It's about taking up the space you're entitled to.\n\nThe most powerful version of this is stillness. Confident people don't fidget, shift their weight, or touch their face constantly. They occupy their space with ease. Practice standing still for 30 seconds in front of a mirror. Notice how different it feels from your default. That feeling is what others perceive as presence.`,
        checkpointQuestion: 'What does constant fidgeting and weight-shifting typically signal to others?',
        checkpointOptions: [
          'Enthusiasm and high energy',
          'Nervousness and low confidence',
          'Friendliness and approachability',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '2-2',
        title: 'Slow Down to Stand Out',
        duration: '3 min',
        isPro: true,
        summary: 'Why slow, deliberate movement is the hallmark of a grounded person.',
        content: `Speed is the enemy of presence. When we're anxious or trying to impress, we speed up — we talk faster, move faster, gesture more frantically. This communicates urgency and insecurity. The person who moves slowly and deliberately communicates something entirely different: that they have nowhere more important to be.\n\nWatch how high-status individuals move in any room. They don't rush. They turn their head slowly when someone calls their name. They take their time sitting down. They pause before speaking. This isn't arrogance — it's groundedness. They're not reacting to the environment; the environment is reacting to them.\n\nFor one day, try moving at 80% of your normal speed. Walk slower. Speak slower. Gesture with intention rather than impulse. You'll feel slightly uncomfortable at first — like you're being too slow. But others will perceive you as calm, confident, and in control. The discomfort is just your nervous system recalibrating.`,
        checkpointQuestion: 'Why do high-status, confident people tend to move more slowly?',
        checkpointOptions: [
          'They are physically tired and conserving energy',
          'They are not reacting to the environment — the environment reacts to them',
          'They are being deliberately dramatic to attract attention',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '2-3',
        title: 'Vocal Depth & Resonance',
        duration: '4 min',
        isPro: true,
        summary: 'Simple exercises to lower your vocal register and speak with authority.',
        content: `Your voice is one of the most powerful tools in your presence arsenal. A voice that resonates from the chest — deep, warm, and unhurried — commands attention and trust. A voice that lives in the throat or nose — thin, fast, or rising at the end of statements — undermines your message regardless of what you're saying.\n\nThe key is resonance, not volume. You don't need to be loud to be heard. You need to speak from your chest cavity, not your throat. Try this: hum with your mouth closed and feel where the vibration is. If it's in your chest and face, you're in the right place. If it's only in your throat, you're too high.\n\nTwo exercises: First, read aloud for 5 minutes daily, consciously dropping your pitch slightly and slowing your pace. Second, practice ending statements with a downward inflection — not a question mark. Upward inflection at the end of statements (uptalk) signals uncertainty. Downward inflection signals conviction. This single change will transform how people receive your words.`,
        checkpointQuestion: 'What does "uptalk" — ending statements with a rising inflection — typically signal?',
        checkpointOptions: [
          'Enthusiasm and engagement with the topic',
          'Uncertainty and seeking approval',
          'Friendliness and warmth',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '2-4',
        title: 'The Power of the Pause',
        duration: '3 min',
        isPro: true,
        summary: 'Strategic silence makes you more compelling than constant talking.',
        content: `Most people are terrified of silence. The moment a conversation lulls, they rush to fill it — with filler words, with noise, with anything to avoid the discomfort. This compulsion to fill silence is one of the most common ways people undermine their own presence.\n\nThe pause is a power move. When someone asks you a question, don't answer immediately. Take a breath. Think. Then speak. This communicates that your words are considered, not reactive. It also creates anticipation — people lean in slightly when they sense you're about to say something deliberate.\n\nPauses also work mid-sentence. Instead of "um" and "uh," just stop. Breathe. Continue. The silence is far more powerful than the filler. It signals that you're comfortable in your own skin, that you don't need to perform or fill every moment. Practice this in low-stakes conversations first. The discomfort fades quickly, and what replaces it is a new kind of confidence.`,
        checkpointQuestion: 'When asked a question in conversation, what does pausing before answering communicate?',
        checkpointOptions: [
          'That you are unsure of yourself and need time to think',
          'That your words are considered and deliberate, not reactive',
          'That you are bored and disengaged from the conversation',
        ],
        checkpointAnswer: 1,
      },
    ],
  },
  {
    id: 3,
    name: 'Authentic Social Dynamics',
    color: '#F59E0B',
    mutedColor: 'rgba(245,158,11,0.12)',
    lessons: [
      {
        id: '3-1',
        title: 'Active Listening That Connects',
        duration: '4 min',
        isPro: false,
        summary: 'Most people listen to reply. Learn to listen to understand — and watch connections deepen.',
        content: `There is a profound difference between hearing someone and truly listening to them. Most people, while someone else is talking, are already composing their response — thinking about what they'll say next, how they'll relate, what story they'll tell. The person speaking can feel this. It creates a subtle but real sense of not being heard.\n\nActive listening means your only job while someone is speaking is to understand them. Not to fix, not to relate, not to impress — just to understand. This requires you to quiet your internal monologue and be genuinely curious about what they're experiencing.\n\nThe practical tools: maintain warm eye contact, nod occasionally (not constantly — that becomes performative), and ask follow-up questions that go deeper rather than sideways. Instead of "Oh, I had a similar experience..." try "What was that like for you?" The person who makes you feel truly heard is the person you want to keep talking to. Be that person.`,
        checkpointQuestion: 'What is the most powerful follow-up question you can ask after someone shares something personal?',
        checkpointOptions: [
          '"Oh, I had something similar happen to me..."',
          '"What was that like for you?"',
          '"That\'s interesting — have you tried doing X instead?"',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '3-2',
        title: 'Playfulness Without Trying',
        duration: '3 min',
        isPro: true,
        summary: 'Natural playfulness comes from security, not performance. Here\'s how to access it.',
        content: `Forced humor is painful to witness. You can feel the effort behind it — the need to be funny, to be liked, to land the joke. Natural playfulness is entirely different. It comes from a place of security, not performance. It's the lightness of someone who doesn't need the interaction to go a certain way.\n\nPlayfulness isn't about being funny. It's about not taking things too seriously. It's the ability to find the absurdity in everyday situations, to tease gently without cruelty, to be surprised and delighted by the world. It's a quality of attention, not a skill set.\n\nThe path to natural playfulness is through security. When you're not monitoring how you're coming across, when you're not trying to manage impressions, you naturally become lighter. You can say something slightly ridiculous because you're not afraid of how it lands. You can laugh at yourself because your self-worth isn't on the line. Playfulness is the exhale of a person who has nothing to prove.`,
        checkpointQuestion: 'What is the foundation of natural, authentic playfulness?',
        checkpointOptions: [
          'Learning more jokes and witty comebacks',
          'Internal security — not needing the interaction to go a certain way',
          'Being more extroverted and talking more in social situations',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '3-3',
        title: 'Creating Emotional Safety',
        duration: '5 min',
        isPro: true,
        summary: 'People open up to those who make them feel safe. Learn the subtle signals that do this.',
        content: `The deepest connections happen when people feel safe enough to be themselves. Emotional safety isn't about being agreeable or avoiding conflict — it's about creating an environment where someone feels they won't be judged, mocked, or dismissed for what they share.\n\nThe signals that create safety are subtle but powerful. Non-judgment: when someone shares something vulnerable, your first response should never be evaluative. No "you should have..." or "that was a mistake." Just acknowledgment: "That sounds really hard." Consistency: people feel safe with those who are predictable — whose mood doesn't swing wildly, who don't suddenly become cold or distant. Discretion: people open up to those they trust to hold their words carefully.\n\nThe paradox of emotional safety is that it requires you to be somewhat vulnerable first. When you share something real about yourself — a struggle, a fear, a genuine opinion — you give others permission to do the same. Vulnerability is contagious. Be the one who goes first.`,
        checkpointQuestion: 'Someone shares a mistake they made. What response creates the most emotional safety?',
        checkpointOptions: [
          '"You should have done X instead — here\'s what I would have done."',
          '"That sounds really hard. What happened next?"',
          '"Don\'t worry about it, everyone makes mistakes."',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '3-4',
        title: 'Natural Conversation Flow',
        duration: '4 min',
        isPro: true,
        summary: 'No scripts. No lines. Just the principles behind effortless conversation.',
        content: `The people who seem effortlessly good at conversation aren't running scripts. They've internalized a few simple principles that make conversation feel natural rather than forced.\n\nPrinciple one: follow genuine curiosity. The best conversations happen when you're actually interested in the other person — not performing interest, but genuinely wanting to understand their world. Curiosity is self-sustaining; it generates its own questions.\n\nPrinciple two: build on what's given. Every statement someone makes contains multiple threads you could pull. "I just got back from Tokyo" contains: the trip itself, why Tokyo, what they do that allows travel, what they found surprising, how it changed them. You never need to manufacture topics — they're always already there.\n\nPrinciple three: share yourself. Conversation is an exchange, not an interview. When you ask questions, also offer your own perspective, experience, or reaction. This creates reciprocity and depth. The goal isn't to extract information — it's to build a shared experience in real time.`,
        checkpointQuestion: 'Someone says "I just got back from a solo trip to Japan." What is the best conversational response?',
        checkpointOptions: [
          '"Cool! I\'ve always wanted to go there."',
          '"What made you decide to go solo? What was that like?"',
          '"Japan is amazing — the food is incredible, right?"',
        ],
        checkpointAnswer: 1,
      },
    ],
  },
  {
    id: 4,
    name: 'Real-World Action Steps',
    color: '#F43F5E',
    mutedColor: 'rgba(244,63,94,0.12)',
    lessons: [
      {
        id: '4-1',
        title: 'The 3-Second Hello Challenge',
        duration: '2 min',
        isPro: false,
        summary: 'One micro-challenge that builds social momentum every single day.',
        content: `Social momentum is real. The more you engage with the world, the easier it becomes. The less you engage, the more daunting it feels. The 3-Second Hello Challenge is designed to keep your social momentum alive every single day with minimal effort.\n\nThe rule is simple: within 3 seconds of having the opportunity to greet someone — a neighbor, a coworker, a stranger in an elevator — do it. Don't deliberate. Don't wait for the perfect moment. Just say hello with a genuine smile and warm eye contact.\n\nThis isn't about becoming a social butterfly. It's about keeping the muscle warm. Each small interaction is a rep. Over time, the hesitation that precedes social engagement shrinks. You stop overthinking and start acting. The 3-second rule prevents the spiral of "should I say something? Is it weird? Maybe not..." — it short-circuits the analysis and replaces it with action. Start today.`,
        checkpointQuestion: 'What is the primary purpose of the 3-Second Hello Challenge?',
        checkpointOptions: [
          'To make as many new friends as possible each day',
          'To keep social momentum alive and reduce hesitation over time',
          'To practice conversation skills with strangers',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '4-2',
        title: 'The Barista Presence Drill',
        duration: '2 min',
        isPro: true,
        summary: 'Use everyday interactions to practice warm eye contact and genuine presence.',
        content: `Every day you have dozens of micro-interactions that most people sleepwalk through: ordering coffee, checking out at a store, passing a colleague in the hallway. These moments are a training ground hiding in plain sight.\n\nThe Barista Presence Drill: the next time you order coffee or interact with any service worker, put your phone away before you reach the counter. Make genuine eye contact. Use their name if they have a name tag. Ask one real question or make one genuine observation — not a script, just something you actually notice or wonder. Then actually listen to their response.\n\nThis drill builds three things simultaneously: the habit of being present (not on your phone), the skill of warm eye contact, and the ability to connect briefly but genuinely with anyone. The barista becomes a training partner. The checkout line becomes a dojo. Presence is a practice, and practice happens in the ordinary moments.`,
        checkpointQuestion: 'What should you do before reaching the counter for the Barista Presence Drill?',
        checkpointOptions: [
          'Prepare a list of interesting conversation topics',
          'Put your phone away and prepare to be fully present',
          'Decide in advance what you will order to save time',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '4-3',
        title: 'The Slow Walk Experiment',
        duration: '3 min',
        isPro: true,
        summary: 'Walk 20% slower for one day. Notice how your internal state shifts.',
        content: `This experiment sounds almost too simple to be worth doing. It isn't. Walking 20% slower than your normal pace for an entire day is a profound exercise in presence and self-awareness.\n\nWhen you slow down physically, something interesting happens internally. The mental chatter quiets slightly. You notice more — the quality of light, the sounds around you, the faces of people passing. You stop being a body in transit and start being a person in a place. This is the beginning of presence.\n\nYou'll also notice how much of your normal pace is driven by anxiety — a low-level urgency that has nothing to do with actual time pressure. Most of us walk fast not because we're late, but because we're uncomfortable with stillness and slowness. The slow walk experiment surfaces this pattern and gives you a choice. You can choose to move through the world with intention rather than urgency. That choice, made repeatedly, becomes a way of being.`,
        checkpointQuestion: 'What does the slow walk experiment primarily reveal about your normal pace?',
        checkpointOptions: [
          'That you are physically unfit and need more exercise',
          'That much of your normal speed is driven by low-level anxiety, not actual urgency',
          'That you are more efficient when moving quickly',
        ],
        checkpointAnswer: 1,
      },
      {
        id: '4-4',
        title: 'The Listening-Only Conversation',
        duration: '3 min',
        isPro: true,
        summary: 'Have a full conversation where your only goal is to understand, not to impress.',
        content: `This is one of the most challenging and revealing exercises in this entire program. The rule: have a full conversation — at least 10 minutes — where your only goal is to understand the other person. You are not there to share your opinions, tell your stories, or demonstrate your knowledge. You are there purely to understand.\n\nYou can ask questions. You can reflect back what you hear. You can express genuine reactions. But you cannot make the conversation about yourself. No "that reminds me of when I..." No "I think..." No "you should..." Just curiosity, questions, and presence.\n\nMost people find this surprisingly difficult. We are so accustomed to using conversation as a vehicle for self-expression that pure listening feels almost unnatural. But the person on the receiving end of this kind of attention feels something rare and powerful: they feel truly seen. And the person who makes others feel truly seen is the most magnetic person in any room.`,
        checkpointQuestion: 'In the Listening-Only Conversation, what is the one thing you must avoid?',
        checkpointOptions: [
          'Asking too many questions, which can feel like an interrogation',
          'Making the conversation about yourself — sharing your stories, opinions, or advice',
          'Showing emotional reactions, which can distract from listening',
        ],
        checkpointAnswer: 1,
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = PILLARS.flatMap((p) => p.lessons);

export function getLessonById(id: string): { lesson: Lesson; pillar: Pillar } | null {
  for (const pillar of PILLARS) {
    const lesson = pillar.lessons.find((l) => l.id === id);
    if (lesson) return { lesson, pillar };
  }
  return null;
}

export const TRACKS = {
  low: { name: 'Grounded Presence', description: 'Building your foundation of inner calm and self-assurance.' },
  mid: { name: 'Social Flow', description: 'Developing natural ease and confidence in social situations.' },
  high: { name: 'Conversational Charisma', description: 'Mastering the art of deep connection and magnetic presence.' },
};

export function getTrackFromScores(scores: number[]): keyof typeof TRACKS {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg < 2.5) return 'low';
  if (avg <= 3.5) return 'mid';
  return 'high';
}
