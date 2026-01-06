
import { GoogleGenAI, Chat } from "@google/genai";
import { CalculationResult, LoanType } from "../types";
import { calculateEMI } from "../utils/math";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// Updated for Simplicity, Precision, and Strict Currency Rules
const SYSTEM_INSTRUCTION = `
You are a smart financial assistant & professional mentor.
Your answers must be SIMPLE, PRECISE, and EFFECTIVE.

CRITICAL RULES:
1. **CURRENCY**: ALWAYS use Indian Rupees (₹) for ALL monetary values.
2. **FORMAT**: Format numbers with commas (e.g., ₹1,50,000).
3. **BREVITY**: Keep responses short. No fluff.
4. **TONE**: For Standard loans: Professional advisor. For Education loans: Encouraging mentor.
`;

export const generateSmartAnalysis = async (result: CalculationResult): Promise<string> => {
  try {
    let specificPrompt = "";

    // --- EDUCATION LOAN LOGIC ---
    if (result.loanType === LoanType.EDUCATION) {
      specificPrompt = `
      CONTEXT: This is a STUDENT EDUCATION LOAN.
      
      TASK:
      1. Assume a typical entry-level salary for a degree costing ₹${result.principal.toLocaleString('en-IN')}.
      2. Analyze the Repayment-to-Income ratio assuming the EMI is ₹${result.emi.toLocaleString('en-IN')}.
      3. Give a "Success Probability" (High/Medium/Low). High means EMI < 30% of likely monthly income.
      4. Suggest if they should look for scholarships or 80E tax benefits.
      `;
    } else {
      // --- STANDARD LOAN LOGIC ---
      let comparisonContext = "";
      if (result.tenureYears > 5) {
        const shorterTenure = result.tenureYears - 5;
        const shorterResult = calculateEMI(result.principal, result.rate, shorterTenure);
        const interestSaved = result.totalInterest - shorterResult.totalInterest;
        const emiIncrease = shorterResult.emi - result.emi;

        comparisonContext = `
        COMPARISON SCENARIO:
        - If tenure reduced by 5 years (to ${shorterTenure} years).
        - Save Interest: ₹${interestSaved.toLocaleString('en-IN')}
        - EMI Increases by: ₹${emiIncrease.toLocaleString('en-IN')}
        `;
      }
      specificPrompt = `
      CONTEXT: Standard Loan.
      ${comparisonContext}
      Explain the total interest commitment and suggest the comparison scenario if it saves money.
      `;
    }

    const prompt = `
    Generate a short report:
    - Loan Amount: ₹${result.principal.toLocaleString('en-IN')}
    - Rate: ${result.rate}%
    - Tenure: ${result.tenureYears} years
    - EMI: ₹${result.emi.toLocaleString('en-IN')}
    
    ${specificPrompt}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Our concierge is currently offline. Please try again later.";
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const explainEMIResults = async (result: CalculationResult): Promise<string> => {
  return generateSmartAnalysis(result);
};

export const compareTenure = async (current: CalculationResult, shorter: CalculationResult): Promise<string> => {
  try {
    const prompt = `
    Compare these two loan options and persuade the user to consider the shorter tenure.

    Option A (Current): ${current.tenureYears} yrs, EMI ₹${current.emi}
    Option B (Faster): ${shorter.tenureYears} yrs, EMI ₹${shorter.emi}

    Highlight interest savings.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "Comparison unavailable.";
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    return "Comparison service offline.";
  }
};
