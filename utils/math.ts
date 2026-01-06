
import { CalculationResult, YearlyData, LoanType } from '../types';

interface EducationParams {
  courseDuration?: number;
  withMoratorium?: boolean;
  withCSIS?: boolean;
}

/**
 * Calculates the EMI and detailed breakdown.
 * Supports Standard and Education Loan logic.
 */
export const calculateEMI = (
  principal: number,
  rate: number,
  tenureYears: number,
  loanType: LoanType = LoanType.STANDARD,
  eduParams: EducationParams = {}
): CalculationResult => {
  
  let finalPrincipal = principal;
  let moratoriumInterest = 0;
  let taxSavings = 0;

  // --- EDUCATION LOAN LOGIC ---
  if (loanType === LoanType.EDUCATION) {
    const { courseDuration = 0, withMoratorium = false, withCSIS = false } = eduParams;

    if (withMoratorium && courseDuration > 0) {
      // Moratorium Period = Course Duration + 6 months (0.5 years)
      const moratoriumYears = courseDuration + 0.5;
      
      // Calculate Simple Interest accrued during moratorium
      // Formula: P * R * T / 100
      const accrued = (principal * rate * moratoriumYears) / 100;

      // If CSIS Scheme applies, Govt pays this interest. User pays 0.
      if (withCSIS) {
        moratoriumInterest = 0; 
      } else {
        moratoriumInterest = accrued;
        // The accrued interest is added to the principal for repayment
        finalPrincipal = principal + moratoriumInterest;
      }
    }
  }

  // --- STANDARD EMI CALCULATION ---
  // Uses finalPrincipal (which might be higher if education loan w/o subsidy)
  const monthlyRate = rate / 12 / 100; // R
  const months = tenureYears * 12; // N

  let emi = 0;
  if (rate === 0) {
    emi = finalPrincipal / months;
  } else {
    emi =
      (finalPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - finalPrincipal; // Interest paid during repayment phase

  // --- SECTION 80E ESTIMATION ---
  // Approx tax savings on interest paid (assuming 20% bracket for avg entry-level job)
  if (loanType === LoanType.EDUCATION) {
    // 80E allows deduction of interest paid for up to 8 years.
    // We estimate average annual saving based on total interest / tenure (capped at 8y logic roughly)
    const annualInterestAvg = totalInterest / tenureYears;
    taxSavings = annualInterestAvg * 0.20; 
  }

  // --- YEARLY BREAKDOWN ---
  const yearlyBreakdown: YearlyData[] = [];
  let balance = finalPrincipal;
  
  let currentYearPrincipal = 0;
  let currentYearInterest = 0;

  for (let m = 1; m <= months; m++) {
    const interestForMonth = balance * monthlyRate;
    const principalForMonth = emi - interestForMonth;
    
    balance -= principalForMonth;
    if (balance < 0) balance = 0; 

    currentYearInterest += interestForMonth;
    currentYearPrincipal += principalForMonth;

    if (m % 12 === 0 || m === months) {
      yearlyBreakdown.push({
        year: Math.ceil(m / 12),
        principalPaid: Math.round(currentYearPrincipal),
        interestPaid: Math.round(currentYearInterest),
        balance: Math.round(balance)
      });
      currentYearPrincipal = 0;
      currentYearInterest = 0;
    }
  }

  return {
    principal: finalPrincipal, // Return the adjusted principal
    rate,
    tenureYears,
    emi,
    totalInterest, // Interest during repayment
    totalPayment,
    yearlyBreakdown,
    loanType,
    moratoriumInterest,
    taxSavings
  };
};
