export type LLMModel = {
  provider: 'Anthropic' | 'OpenAI' | 'Google';
  label: string;
  id: string;
  apiKeyPrefix: string;
  docsUrl: string;
};

export type KeywordProposal = {
  text: string;
  group?: 'semantic' | 'synonyms' | 'volume' | 'llm';
  volume: 'low' | 'medium' | 'high';
  rationale: string;
  selected: boolean;
  isPrimary?: boolean;
};

export type AhrefsKeywordData = {
  sv: number | null;
  kd: number | null;
  country: string;
};

export type AhrefsSerpInsight = {
  avgWords: number | null;
  dominantIntent: string | null;
  top3Urls: string[];
};

export type BriefConfig = {
  title: string;
  language: string;
  modelId: string;
  provider: string;
  apiKey: string;
  saveApiKey: boolean;
  ahrefsApiKey: string;
  saveAhrefsApiKey: boolean;
};

export type HistoryEntry = {
  id: string;
  title: string;
  model: string;
  provider: string;
  language: string;
  timestamp: string;
  content: string;
  keywordCount: number;
};

export type AppError = {
  type: 'auth' | 'rate_limit' | 'server' | 'network' | 'parse' | 'validation';
  message: string;
  action?: string;
  actionUrl?: string;
};

export type SeedSuggestions = string[];

export type AppState = {
  currentStep: number;
  config: BriefConfig;
  seedKeywords: string[];
  suggestedSeedKeywords: SeedSuggestions | null;
  keywordProposals: KeywordProposal[];
  brief: string;
  history: HistoryEntry[];
  isLoading: boolean;
  isStreaming: boolean;
  error: AppError | null;
  showHistory: boolean;

  // Ahrefs state
  ahrefsData: Record<string, AhrefsKeywordData>;
  ahrefsRelated: string[];
  serpInsight: AhrefsSerpInsight | null;
  isLoadingAhrefs: boolean;
  ahrefsError: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateConfig: (partial: Partial<BriefConfig>) => void;
  addSeedKeyword: (keyword: string) => void;
  removeSeedKeyword: (keyword: string) => void;
  setSuggestedSeeds: (seeds: SeedSuggestions | null) => void;
  setKeywordProposals: (proposals: KeywordProposal[]) => void;
  toggleKeyword: (index: number) => void;
  setPrimaryKeyword: (index: number | null) => void;
  selectAllKeywords: () => void;
  deselectAllKeywords: () => void;
  getSelectedKeywords: () => KeywordProposal[];
  setBrief: (brief: string) => void;
  appendBrief: (chunk: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: AppError | null) => void;
  addToHistory: (entry: HistoryEntry) => void;
  removeFromHistory: (id: string) => void;
  loadFromHistory: (id: string) => void;
  setShowHistory: (show: boolean) => void;
  resetSession: () => void;

  // Ahrefs actions
  setAhrefsData: (data: Record<string, AhrefsKeywordData>) => void;
  setAhrefsRelated: (related: string[]) => void;
  setSerpInsight: (insight: AhrefsSerpInsight | null) => void;
  setLoadingAhrefs: (loading: boolean) => void;
  setAhrefsError: (error: string | null) => void;
};

export const VOLUME_LABELS: Record<string, string> = {
  low: '< 500/mo',
  medium: '500–2K/mo',
  high: '> 2K/mo',
};

export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Dutch', label: 'Nederlands' },
  { value: 'Polish', label: 'Polski' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Korean', label: '한국어' },
  { value: 'Chinese', label: '中文' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'Turkish', label: 'Türkçe' },
  { value: 'Russian', label: 'Русский' },
];
