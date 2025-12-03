// /src/data/exampleLogs.ts
export const exampleLogs = [
  {
    type: 'system' as const,
    message: 'Initializing Brainiark OS...',
    details: 'Loading neural modules'
  },
  {
    type: 'action' as const,
    message: 'Scanning uploaded brand guidelines PDF',
    details: 'Extracting color palette and typography'
  },
  {
    type: 'insight' as const,
    message: 'Primary brand color detected: #3B82F6',
    details: 'Consistent with modern tech brands'
  },
  {
    type: 'system' as const,
    message: 'Analyzing website structure',
    details: 'Found 12 unique page layouts'
  },
  {
    type: 'insight' as const,
    message: 'Content pillars identified: Product, Team, Culture',
    details: 'Each pillar has consistent tone and imagery'
  },
  {
    type: 'action' as const,
    message: 'Fusing evidence sources...',
    details: 'Creating unified brand understanding'
  },
  {
    type: 'insight' as const,
    message: 'Brand personality: Innovative, Trustworthy, Human',
    details: 'Based on language patterns across sources'
  },
  {
    type: 'action' as const,
    message: 'Generating content strategy framework',
    details: 'Using identified pillars and audience insights'
  }
];