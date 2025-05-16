import TogetherAI from 'together-ai';
import { QuestionRating } from '../../shared/schema';

type XPEvaluatorOptions = {
  apiKey: string;
};

export class XPEvaluator {
  private client: any;
  private model: string = 'google/gemma-7b-it'; // The smaller, more efficient model for evaluations
  
  constructor(options: XPEvaluatorOptions) {
    // Create client with proper type handling
    this.client = new TogetherAI(options.apiKey as any);
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