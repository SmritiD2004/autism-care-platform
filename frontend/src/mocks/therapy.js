// Mock therapy data for clinician therapy plans page
export const patients = [
  {
    id: 1,
    name: 'Alex Johnson',
    initials: 'AJ',
    age: 6,
    severity: 'Moderate',
    risk: 0.62,
  },
  {
    id: 2,
    name: 'Sam Chen',
    initials: 'SC',
    age: 8,
    severity: 'Mild',
    risk: 0.38,
  },
  {
    id: 3,
    name: 'Jordan Lee',
    initials: 'JL',
    age: 5,
    severity: 'Severe',
    risk: 0.81,
  },
];

export const plans = {
  1: {
    recommended: {
      name: 'Intensive ABA + Speech Therapy',
      confidence: 0.94,
    },
    alternative: {
      name: 'Moderate ABA + Occupational Therapy',
      confidence: 0.78,
    },
    goals: [
      {
        id: 1,
        title: 'Improve verbal communication',
        progress: 65,
        therapist: 'Dr. Sarah Mills',
      },
      {
        id: 2,
        title: 'Develop social interaction skills',
        progress: 45,
        therapist: 'Dr. Sarah Mills',
      },
      {
        id: 3,
        title: 'Reduce sensory-seeking behaviors',
        progress: 72,
        therapist: 'Linda Park',
      },
    ],
    recommended: {
      name: 'Intensive ABA + Speech Therapy',
      confidence: 0.94,
      therapies: [
        { name: 'Applied Behavior Analysis', frequency: '5x/week', duration: '90 min' },
        { name: 'Speech Therapy', frequency: '3x/week', duration: '60 min' },
        { name: 'Occupational Therapy', frequency: '2x/week', duration: '60 min' },
      ],
      outcomes: [
        { name: 'Communication Score', improvement: '+28%', confidence: '92%' },
        { name: 'Social Skills', improvement: '+15%', confidence: '87%' },
        { name: 'Independence', improvement: '+22%', confidence: '89%' },
      ],
      cost: {
        monthly: 12500,
        duration: '6 months',
        breakdown: [
          { service: 'ABA', cost: 7500 },
          { service: 'Speech Therapy', cost: 3000 },
          { service: 'OT', cost: 2000 },
        ],
      },
    },
    alternative: {
      name: 'Moderate ABA + Occupational Therapy',
      confidence: 0.78,
      therapies: [
        { name: 'Applied Behavior Analysis', frequency: '3x/week', duration: '90 min' },
        { name: 'Occupational Therapy', frequency: '3x/week', duration: '60 min' },
      ],
      outcomes: [
        { name: 'Communication Score', improvement: '+18%', confidence: '81%' },
        { name: 'Social Skills', improvement: '+12%', confidence: '76%' },
        { name: 'Independence', improvement: '+14%', confidence: '79%' },
      ],
      cost: {
        monthly: 8500,
        duration: '6 months',
        breakdown: [
          { service: 'ABA', cost: 5000 },
          { service: 'OT', cost: 3500 },
        ],
      },
    },
  },
  2: {
    recommended: {
      name: 'ABA + Social Skills Group',
      confidence: 0.88,
    },
    alternative: {
      name: 'Speech + Behavioral Support',
      confidence: 0.72,
    },
    goals: [
      {
        id: 1,
        title: 'Build peer interaction skills',
        progress: 58,
        therapist: 'Dr. Michael Brown',
      },
      {
        id: 2,
        title: 'Expand vocabulary',
        progress: 71,
        therapist: 'Jennifer Wong',
      },
    ],
    recommended: {
      name: 'ABA + Social Skills Group',
      confidence: 0.88,
      therapies: [
        { name: 'Applied Behavior Analysis', frequency: '3x/week', duration: '60 min' },
        { name: 'Social Skills Group', frequency: '2x/week', duration: '90 min' },
      ],
      outcomes: [
        { name: 'Social Engagement', improvement: '+24%', confidence: '85%' },
        { name: 'Communication Score', improvement: '+19%', confidence: '83%' },
      ],
      cost: {
        monthly: 6800,
        duration: '6 months',
        breakdown: [
          { service: 'ABA', cost: 4000 },
          { service: 'Social Skills', cost: 2800 },
        ],
      },
    },
    alternative: {
      name: 'Speech + Behavioral Support',
      confidence: 0.72,
      therapies: [
        { name: 'Speech Therapy', frequency: '2x/week', duration: '60 min' },
        { name: 'Behavioral Coaching', frequency: '1x/week', duration: '60 min' },
      ],
      outcomes: [
        { name: 'Social Engagement', improvement: '+16%', confidence: '70%' },
        { name: 'Communication Score', improvement: '+12%', confidence: '68%' },
      ],
      cost: {
        monthly: 4500,
        duration: '6 months',
        breakdown: [
          { service: 'Speech Therapy', cost: 2800 },
          { service: 'Behavioral Support', cost: 1700 },
        ],
      },
    },
  },
  3: {
    recommended: {
      name: 'Intensive Comprehensive Program',
      confidence: 0.91,
    },
    alternative: {
      name: 'ABA + Speech + OT Combo',
      confidence: 0.84,
    },
    goals: [
      {
        id: 1,
        title: 'Reduce self-stimulatory behaviors',
        progress: 52,
        therapist: 'Dr. Rachel Green',
      },
      {
        id: 2,
        title: 'Improve emotional regulation',
        progress: 38,
        therapist: 'Dr. Rachel Green',
      },
      {
        id: 3,
        title: 'Develop daily living skills',
        progress: 48,
        therapist: 'Mark Paulson',
      },
    ],
    recommended: {
      name: 'Intensive Comprehensive Program',
      confidence: 0.91,
      therapies: [
        { name: 'Applied Behavior Analysis', frequency: '6x/week', duration: '120 min' },
        { name: 'Speech Therapy', frequency: '4x/week', duration: '60 min' },
        { name: 'Occupational Therapy', frequency: '3x/week', duration: '60 min' },
        { name: 'Social Skills Training', frequency: '2x/week', duration: '90 min' },
      ],
      outcomes: [
        { name: 'Behavioral Control', improvement: '+34%', confidence: '93%' },
        { name: 'Communication Score', improvement: '+31%', confidence: '91%' },
        { name: 'Daily Living Skills', improvement: '+27%', confidence: '89%' },
      ],
      cost: {
        monthly: 18500,
        duration: '12 months',
        breakdown: [
          { service: 'ABA', cost: 10000 },
          { service: 'Speech Therapy', cost: 4000 },
          { service: 'OT', cost: 3000 },
          { service: 'Social Skills', cost: 1500 },
        ],
      },
    },
    alternative: {
      name: 'ABA + Speech + OT Combo',
      confidence: 0.84,
      therapies: [
        { name: 'Applied Behavior Analysis', frequency: '4x/week', duration: '90 min' },
        { name: 'Speech Therapy', frequency: '3x/week', duration: '60 min' },
        { name: 'Occupational Therapy', frequency: '2x/week', duration: '60 min' },
      ],
      outcomes: [
        { name: 'Behavioral Control', improvement: '+22%', confidence: '85%' },
        { name: 'Communication Score', improvement: '+20%', confidence: '82%' },
        { name: 'Daily Living Skills', improvement: '+18%', confidence: '80%' },
      ],
      cost: {
        monthly: 12500,
        duration: '12 months',
        breakdown: [
          { service: 'ABA', cost: 6500 },
          { service: 'Speech Therapy', cost: 4000 },
          { service: 'OT', cost: 2000 },
        ],
      },
    },
  },
};
