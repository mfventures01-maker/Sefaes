import { MarkingScheme } from './types';

export const DEFAULT_MARKING_SCHEMES: MarkingScheme[] = [
  {
    id: '1A',
    subject: 'Multimedia Management',
    question: 'Effective leadership in multimedia organizations requires a blend of various attributes, discuss.',
    referenceAnswer: 'Effective leadership in multimedia organizations requires creative vision, technical knowledge, emotional intelligence, communication, adaptability, and teamwork. A good leader blends innovation, empathy, and management competence to guide multimedia teams effectively.',
    keywords: ['creative vision', 'innovation', 'technical', 'communication', 'collaboration', 'empathy', 'emotional intelligence', 'adaptability', 'flexibility', 'management', 'leadership', 'teamwork'],
    maxScore: 10,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: true,
      repetitionSeverity: 'Medium',
      requireStructure: true,
      structureComponents: "Introduction, Attributes, Conclusion",
      toneExpectation: 'Academic',
      additionalInstructions: "Ensure all core attributes like empathy and technical knowledge are mentioned."
    }
  },
  {
    id: '1B',
    subject: 'Multimedia Management',
    question: 'What is leadership in relation to multimedia management?',
    referenceAnswer: 'Leadership in multimedia management refers to the ability to guide, inspire, and coordinate creative and technical teams toward achieving the goals of a multimedia project. It involves vision, decision-making, communication, and motivation to balance creativity with productivity.',
    keywords: ['guiding', 'inspire', 'coordinate', 'creative', 'technical', 'vision', 'decision-making', 'communication', 'motivation', 'management'],
    maxScore: 10,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: "Focus on the definition of leadership within the specific context of multimedia projects."
    }
  },
  {
    id: '2A',
    subject: 'Multimedia Management',
    question: 'Examine the two major leadership attributes that foster a positive working environment.',
    referenceAnswer: 'Two major leadership attributes that foster a positive working environment are effective communication and empathy. Communication builds trust and teamwork, while empathy allows leaders to understand and respond to employees’ needs, creating motivation and harmony.',
    keywords: ['communication', 'empathy', 'trust', 'teamwork', 'motivation', 'understanding', 'support', 'positive environment'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: "The answer must specifically highlight communication and empathy as the two pillars."
    }
  },
  {
    id: '2B',
    subject: 'Multimedia Management',
    question: 'Mention the various categories of multimedia products.',
    referenceAnswer: 'The main categories of multimedia products include educational multimedia, entertainment multimedia, informational multimedia, advertising multimedia, and training multimedia.',
    keywords: ['educational', 'entertainment', 'infomational', 'advertising', 'training', 'interactive', 'presentation'],
    maxScore: 5,
    customRules: {
      strictGrammar: false,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Neutral',
      additionalInstructions: "List formatting is acceptable."
    }
  },
  {
    id: '3A',
    subject: 'Multimedia Management',
    question: 'Identify and explain the different leadership style adoptable in multimedia organization.',
    referenceAnswer: 'Leadership styles adoptable in multimedia organizations include democratic, autocratic, transformational, and laissez-faire styles. Democratic leaders encourage participation, autocratic leaders maintain control, transformational leaders inspire creativity, and laissez-faire leaders give freedom to creative teams.',
    keywords: ['democratic', 'autocratic', 'transformational', 'laissez-faire', 'participation', 'control', 'creativity', 'freedom'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: true,
      structureComponents: "List of Styles, Explanations",
      toneExpectation: 'Academic',
      additionalInstructions: "Explanations for each style are mandatory for full marks."
    }
  },
  {
    id: '3B',
    subject: 'Multimedia Management',
    question: 'What are the major positive effects of branding?',
    referenceAnswer: 'Positive effects of branding include increased product recognition, customer loyalty, trust, competitive advantage, and perceived value. It also helps businesses attract and retain customers.',
    keywords: ['recognition', 'loyalty', 'trust', 'competitive advantage', 'value', 'customer', 'image', 'identity'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: true,
      repetitionSeverity: 'Low',
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: ""
    }
  },
  {
    id: '4A',
    subject: 'Multimedia Management',
    question: 'What are the professional skills needed to be outstanding in multimedia industry.',
    referenceAnswer: 'Professional skills needed in the multimedia industry include creativity, technical competence, communication, teamwork, adaptability, problem-solving, and time management.',
    keywords: ['creativity', 'technical', 'communication', 'teamwork', 'adaptability', 'problem-solving', 'time management'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: ""
    }
  },
  {
    id: '4B',
    subject: 'Multimedia Management',
    question: 'What are the various forms and types of branding?',
    referenceAnswer: 'The various forms and types of branding include product branding, corporate branding, service branding, personal branding, and digital branding.',
    keywords: ['product branding', 'corporate branding', 'service branding', 'personal branding', 'digital branding', 'type', 'form'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: ""
    }
  },
  {
    id: '5A',
    subject: 'Multimedia Management',
    question: 'Define image building and outline the importance of image building in multimedia industry.',
    referenceAnswer: 'Image building is the process of developing and maintaining a positive public perception of a brand or organization. In multimedia, it is important because it promotes trust, credibility, visibility, and a strong brand reputation.',
    keywords: ['image building', 'reputation', 'credibility', 'trust', 'visibility', 'public perception', 'branding'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: true,
      repetitionSeverity: 'Medium',
      requireStructure: true,
      structureComponents: "Definition, Importance",
      toneExpectation: 'Academic',
      additionalInstructions: ""
    }
  },
  {
    id: '5B',
    subject: 'Multimedia Management',
    question: 'Effective branding techniques must include the following.',
    referenceAnswer: 'Effective branding techniques include consistent visual identity, storytelling, audience engagement, quality service delivery, and emotional connection with consumers.',
    keywords: ['visual identity', 'storytelling', 'engagement', 'quality', 'emotional connection', 'consistency', 'branding techniques'],
    maxScore: 5,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: false,
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: ""
    }
  },
  {
    id: '6',
    subject: 'Multimedia Management',
    question: 'Itemize any three effective branding technique known to you.',
    referenceAnswer: 'Three effective branding techniques are maintaining consistency in brand image, using storytelling to connect with audiences, and ensuring quality product or service delivery.',
    keywords: ['consistency', 'storytelling', 'quality', 'branding technique', 'engagement', 'brand image'],
    maxScore: 10,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: true,
      repetitionSeverity: 'Medium',
      requireStructure: false,
      toneExpectation: 'Academic',
      additionalInstructions: "Only the first three distinct techniques should be evaluated."
    }
  },
  {
    id: '7',
    subject: 'Multimedia Management',
    question: 'Discuss branding in relation to marketing and product.',
    referenceAnswer: 'Branding in relation to marketing and product refers to creating a unique identity that differentiates a product in the market. Effective branding supports marketing strategies, influences consumer perception, and strengthens product value and loyalty.',
    keywords: ['branding', 'marketing', 'product', 'identity', 'differentiation', 'consumer perception', 'value', 'loyalty', 'advertising'],
    maxScore: 10,
    customRules: {
      strictGrammar: true,
      penalizeRepetition: true,
      repetitionSeverity: 'High',
      requireStructure: true,
      structureComponents: "Introduction, Relationships, Conclusion",
      toneExpectation: 'Academic',
      additionalInstructions: "Focus on how branding acts as a bridge between marketing and the physical product."
    }
  }
];