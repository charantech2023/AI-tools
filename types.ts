export interface SiblingLink {
  anchorText: string;
  placement: {
    quote: string;
    nearestHeading: string;
  };
  url: string;
}

export interface StatAndFact {
  metricAndValue: string;
  yearAndGeography: string;
  sourceCitation: string;
}

export interface ProTip {
  tip: string;
  placement: {
    quote: string;
    nearestHeading: string;
  };
}

export interface AnalysisResult {
  pageIntent: string;
  keyTakeaways: string[];
  siblingLinks: SiblingLink[];
  statsAndKeyFacts: StatAndFact[];
  proTips: ProTip[];
  conclusion: string;
  aiSEOCapsule: string;
}