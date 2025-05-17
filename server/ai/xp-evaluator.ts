import { QuestionRating } from '../types/schema.js';

type XPEvaluatorOptions = {
  apiKey: string;
};

export class XPEvaluator {
  private client: {
    evaluate: (params: {
      question: string;
      response: string;
      criteria: string[];
    }) => Promise<{
      rating: string;
    }>;
  };
  private model: string = 'google/gemma-7b-it'; // The smaller, more efficient model for evaluations
  
  constructor(options: XPEvaluatorOptions) {
    const togetherApiUrl = process.env.TOGETHER_AI_API_URL || 'https://api.together.xyz/v1/completions';
    
    this.client = {
      evaluate: async (params) => {
        try {
          const response = await fetch(togetherApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${options.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: this.model,
              prompt: `Evaluate the following question and response:\nQuestion: ${params.question}\nResponse: ${params.response}\nCriteria: ${params.criteria.join(', ')}\nRating:`,
              max_tokens: 100,
              temperature: 0.3,
              top_p: 0.9,
              stop: ["\n"]
            })
          });
          
          if (!response.ok) {
            throw new Error(`TogetherAI API error: ${response.statusText}`);
          }
          
          const result = await response.json();
          return {
            rating: result.output?.text || 'decent'
          };
        } catch (error) {
          console.error('Error evaluating with TogetherAI:', error);
          throw error;
        }
      }
    };
  }
  
  /**
   * Evaluates the quality of a user's question and determines XP reward
   * 
   * @param question The user's question
   * @param response The AI's response
   * @returns A rating and corresponding XP amount
   */
  async evaluateQuestion(question: string, response: string): Promise<{
    rating: QuestionRating;
    xpAmount: number;
  }> {
    try {
      if (!question || !response) {
        throw new Error('Question and response are required for evaluation');
      }

      // Validate input lengths
      if (question.length > 1000 || response.length > 2000) {
        throw new Error('Input exceeds maximum length limits');
      }

      // Get evaluation from AI
      const evaluation = await this.client.evaluate({
        question,
        response,
        criteria: ['accuracy', 'completeness', 'clarity']
      });

      if (!evaluation || !evaluation.rating) {
        throw new Error('Invalid evaluation response from AI');
      }

      // Normalize rating
      const normalizedRating = this.normalizeRating(evaluation.rating);
      
      // Map rating to XP amount
      const xpAmount = this.mapRatingToXP(normalizedRating);
      
      return {
        rating: normalizedRating,
        xpAmount
      };
    } catch (error) {
      console.error('Error evaluating question:', error);
      
      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          return {
            rating: 'needs_improvement',
            xpAmount: 10
          };
        }
        if (error.message.includes('length')) {
          return {
            rating: 'incorrect',
            xpAmount: 0
          };
        }
      }
      
      // Default fallback
      return {
        rating: 'decent',
        xpAmount: 20
      };
    }
  }
  
  /**
   * Cleans and normalizes the AI's rating output
   */
  private normalizeRating(ratingText: string): QuestionRating {
    const cleanedRating = ratingText
      .replace(/<assistant>/g, '')
      .replace(/<\/assistant>/g, '')
      .trim()
      .toLowerCase();
    
    // Extract just the rating word using keyword matching
    if (cleanedRating.includes('amazing')) {
      return 'amazing';
    } else if (cleanedRating.includes('needs_improvement') || cleanedRating.includes('needs improvement')) {
      return 'needs_improvement';
    } else if (cleanedRating.includes('incorrect')) {
      return 'incorrect';
    } else {
      // Default to 'decent' if we can't clearly determine the rating
      return 'decent';
    }
  }
  
  /**
   * Maps rating categories to XP amounts according to the Study Nova rules
   */
  private mapRatingToXP(rating: QuestionRating): number {
    switch (rating) {
      case 'amazing':
        return 30;
      case 'decent':
        return 20;
      case 'needs_improvement':
        return 10;
      case 'incorrect':
        return 0;
      default:
        return 20; // Default to 'decent' rating
    }
  }
}