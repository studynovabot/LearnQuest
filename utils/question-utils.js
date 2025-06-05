// Utility functions for question analysis and subject mapping

// Get subject from agent ID
export function getSubjectFromAgent(agentId) {
  const subjectMap = {
    '1': 'general',
    '2': 'mathematics',
    '3': 'science',
    '4': 'language',
    '5': 'history',
    '6': 'geography',
    '7': 'physics',
    '8': 'chemistry',
    '9': 'biology',
    '10': 'english',
    '11': 'programming',
    '12': 'art',
    '13': 'music',
    '14': 'sports',
    '15': 'motivation'
  };
  
  return subjectMap[agentId] || 'general';
}

// Extract question data from user input
export function extractQuestionData(content) {
  // Default response
  const result = {
    isQuestion: false,
    complexity: 'medium',
    conceptTags: [],
    questionType: 'general'
  };
  
  if (!content) return result;
  
  const lowerContent = content.toLowerCase();
  
  // Check if this is a question
  result.isQuestion = lowerContent.includes('?') || 
                      lowerContent.startsWith('what') || 
                      lowerContent.startsWith('how') || 
                      lowerContent.startsWith('why') || 
                      lowerContent.startsWith('when') || 
                      lowerContent.startsWith('where') ||
                      lowerContent.startsWith('can you explain') ||
                      lowerContent.startsWith('could you tell me') ||
                      lowerContent.startsWith('i need help with') ||
                      lowerContent.startsWith('explain');
  
  // If not a question, return early
  if (!result.isQuestion) return result;
  
  // Estimate complexity based on length and vocabulary
  const wordCount = content.split(/\s+/).length;
  const complexWords = ['analyze', 'synthesize', 'evaluate', 'compare', 'contrast', 
                        'differentiate', 'integrate', 'derive', 'prove', 'theorem',
                        'complex', 'advanced', 'difficult', 'challenging'];
  
  const hasComplexWords = complexWords.some(word => lowerContent.includes(word));
  
  if (wordCount > 30 || hasComplexWords) {
    result.complexity = 'hard';
  } else if (wordCount < 10 && !hasComplexWords) {
    result.complexity = 'easy';
  }
  
  // Extract potential concept tags (simplified)
  const commonConcepts = {
    mathematics: ['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'probability'],
    science: ['physics', 'chemistry', 'biology', 'astronomy', 'geology'],
    language: ['grammar', 'vocabulary', 'writing', 'reading', 'literature'],
    history: ['ancient', 'medieval', 'modern', 'world war', 'revolution'],
    geography: ['map', 'climate', 'continent', 'country', 'region'],
    programming: ['algorithm', 'function', 'variable', 'class', 'object', 'loop']
  };
  
  // Check for concepts in the content
  Object.values(commonConcepts).flat().forEach(concept => {
    if (lowerContent.includes(concept)) {
      result.conceptTags.push(concept);
    }
  });
  
  // Determine question type
  if (lowerContent.includes('define') || lowerContent.includes('what is') || lowerContent.includes('meaning')) {
    result.questionType = 'definition';
  } else if (lowerContent.includes('how to') || lowerContent.includes('steps') || lowerContent.includes('process')) {
    result.questionType = 'procedural';
  } else if (lowerContent.includes('why') || lowerContent.includes('reason')) {
    result.questionType = 'conceptual';
  } else if (lowerContent.includes('example') || lowerContent.includes('instance')) {
    result.questionType = 'example';
  } else if (lowerContent.includes('difference') || lowerContent.includes('compare') || lowerContent.includes('contrast')) {
    result.questionType = 'comparative';
  }
  
  return result;
}