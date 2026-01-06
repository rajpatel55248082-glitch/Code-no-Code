
export interface CalculationResult {
  principal: number;
  rate: number;
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  yearlyBreakdown: YearlyData[];
  // Education Specifics
  loanType: LoanType;
  moratoriumInterest?: number;
  taxSavings?: number;
}

export interface YearlyData {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface EMILog {
  id: string;
  date: string;
  principal: number;
  rate: number;
  tenureYears: number;
  emi: number;
  totalInterest: number;
}

export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  isStreaming?: boolean;
}

export enum LoanType {
  STANDARD = 'Standard',
  EDUCATION = 'Education'
}
