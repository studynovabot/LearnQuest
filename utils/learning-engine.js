// Personalized Learning Engine for LearnQuest
// Provides recommendations, learning paths, and adaptive difficulty based on user performance

/**
 * Generate personalized learning recommendations based on user performance data
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to generate recommendations for (optional)
 * @returns {Promise<Object>} - Personalized recommendations
 */
export async function generatePersonalizedRecommendations(db, userId, subject = null) {
  try {
    // Get user performance data
    const performanceData = await getUserPerformanceData(db, userId, subject);
    if (!performanceData || performanceData.length === 0) {
      return {
        success: false,
        message: 'Not enough performance data to generate recommendations',
        recommendations: []
      };
    }

    // Get user knowledge maps
    const knowledgeMaps = await getUserKnowledgeMaps(db, userId, subject);
    
    // Generate recommendations based on performance and knowledge maps
    const recommendations = [];
    
    // 1. Identify knowledge gaps (concepts with low mastery)
    const knowledgeGaps = identifyKnowledgeGaps(knowledgeMaps);
    if (knowledgeGaps.length > 0) {
      recommendations.push({
        type: 'knowledge_gap',
        priority: 'high',
        title: 'Focus on these concepts',
        description: 'These concepts need more attention based on your recent performance',
        items: knowledgeGaps.slice(0, 3).map(gap => ({
          concept: gap.concept,
          subject: gap.subject,
          mastery: gap.mastery,
          suggestedAction: `Practice more ${gap.concept} questions in ${gap.subject}`
        }))
      });
    }
    
    // 2. Identify strengths (concepts with high mastery)
    const strengths = identifyStrengths(knowledgeMaps);
    if (strengths.length > 0) {
      recommendations.push({
        type: 'strength',
        priority: 'medium',
        title: 'Your strengths',
        description: 'You\'re doing well in these areas',
        items: strengths.slice(0, 3).map(strength => ({
          concept: strength.concept,
          subject: strength.subject,
          mastery: strength.mastery,
          suggestedAction: `Try more advanced ${strength.concept} questions in ${strength.subject}`
        }))
      });
    }
    
    // 3. Recommend subjects that need improvement
    const subjectsToImprove = identifySubjectsToImprove(performanceData);
    if (subjectsToImprove.length > 0) {
      recommendations.push({
        type: 'subject_improvement',
        priority: 'medium',
        title: 'Subjects to focus on',
        description: 'These subjects need more attention',
        items: subjectsToImprove.slice(0, 3).map(subj => ({
          subject: subj.subject,
          accuracy: subj.accuracy,
          suggestedAction: `Spend more time on ${subj.subject} to improve your understanding`
        }))
      });
    }
    
    // 4. Learning streak recommendations
    const streakRecommendation = generateStreakRecommendation(performanceData);
    if (streakRecommendation) {
      recommendations.push(streakRecommendation);
    }
    
    // 5. Difficulty adjustment recommendations
    const difficultyRecommendations = generateDifficultyRecommendations(performanceData, knowledgeMaps);
    if (difficultyRecommendations.length > 0) {
      recommendations.push({
        type: 'difficulty_adjustment',
        priority: 'medium',
        title: 'Challenge yourself',
        description: 'Based on your performance, we recommend adjusting difficulty levels',
        items: difficultyRecommendations.slice(0, 3)
      });
    }
    
    // 6. Generate personalized action plan
    const actionPlan = generateActionPlan(performanceData, knowledgeMaps, recommendations);
    
    return {
      success: true,
      recommendations,
      actionPlan,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return {
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    };
  }
}

/**
 * Get user performance data across all subjects or for a specific subject
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to filter by (optional)
 * @returns {Promise<Array>} - Array of performance data objects
 */
async function getUserPerformanceData(db, userId, subject = null) {
  try {
    let query = db.collection('user_performance').where('userId', '==', userId);
    
    if (subject) {
      query = query.where('subject', '==', subject);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching user performance data:', error);
    return [];
  }
}

/**
 * Get user knowledge maps across all subjects or for a specific subject
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to filter by (optional)
 * @returns {Promise<Array>} - Array of knowledge map objects
 */
async function getUserKnowledgeMaps(db, userId, subject = null) {
  try {
    let query = db.collection('user_knowledge_maps').where('userId', '==', userId);
    
    if (subject) {
      query = query.where('subject', '==', subject);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching user knowledge maps:', error);
    return [];
  }
}

/**
 * Identify knowledge gaps from knowledge maps
 * @param {Array} knowledgeMaps - Array of knowledge map objects
 * @returns {Array} - Array of knowledge gap objects
 */
function identifyKnowledgeGaps(knowledgeMaps) {
  const gaps = [];
  
  knowledgeMaps.forEach(map => {
    const subject = map.subject;
    
    if (map.concepts) {
      Object.entries(map.concepts).forEach(([concept, data]) => {
        // Consider concepts with mastery below 40% as gaps
        if (data.mastery < 40) {
          gaps.push({
            subject,
            concept,
            mastery: data.mastery,
            complexity: data.complexity,
            lastInteractionAt: data.lastInteractionAt
          });
        }
      });
    }
  });
  
  // Sort by mastery (ascending) and recency (descending)
  return gaps.sort((a, b) => {
    // First sort by mastery (lowest first)
    if (a.mastery !== b.mastery) {
      return a.mastery - b.mastery;
    }
    
    // Then by recency (most recent first)
    const timeA = a.lastInteractionAt instanceof Date ? a.lastInteractionAt : new Date(a.lastInteractionAt);
    const timeB = b.lastInteractionAt instanceof Date ? b.lastInteractionAt : new Date(b.lastInteractionAt);
    return timeB - timeA;
  });
}

/**
 * Identify strengths from knowledge maps
 * @param {Array} knowledgeMaps - Array of knowledge map objects
 * @returns {Array} - Array of strength objects
 */
function identifyStrengths(knowledgeMaps) {
  const strengths = [];
  
  knowledgeMaps.forEach(map => {
    const subject = map.subject;
    
    if (map.concepts) {
      Object.entries(map.concepts).forEach(([concept, data]) => {
        // Consider concepts with mastery above 75% as strengths
        if (data.mastery > 75) {
          strengths.push({
            subject,
            concept,
            mastery: data.mastery,
            complexity: data.complexity,
            totalInteractions: data.totalInteractions
          });
        }
      });
    }
  });
  
  // Sort by mastery (descending) and interaction count (descending)
  return strengths.sort((a, b) => {
    // First sort by mastery (highest first)
    if (a.mastery !== b.mastery) {
      return b.mastery - a.mastery;
    }
    
    // Then by interaction count (highest first)
    return b.totalInteractions - a.totalInteractions;
  });
}

/**
 * Identify subjects that need improvement
 * @param {Array} performanceData - Array of performance data objects
 * @returns {Array} - Array of subject improvement objects
 */
function identifySubjectsToImprove(performanceData) {
  // Filter subjects with accuracy below 70% or progress below 50%
  const subjectsToImprove = performanceData
    .filter(data => data.averageAccuracy < 70 || data.progress < 50)
    .map(data => ({
      subject: data.subject,
      accuracy: data.averageAccuracy,
      progress: data.progress,
      status: data.status,
      totalInteractions: data.totalInteractions
    }));
  
  // Sort by accuracy (ascending)
  return subjectsToImprove.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Generate streak recommendation based on performance data
 * @param {Array} performanceData - Array of performance data objects
 * @returns {Object|null} - Streak recommendation object or null
 */
function generateStreakRecommendation(performanceData) {
  // Find the subject with the highest streak
  let maxStreak = 0;
  let maxStreakSubject = null;
  
  performanceData.forEach(data => {
    const streak = data.streakDays || 0;
    if (streak > maxStreak) {
      maxStreak = streak;
      maxStreakSubject = data.subject;
    }
  });
  
  if (maxStreak === 0) {
    return {
      type: 'streak',
      priority: 'low',
      title: 'Start a learning streak',
      description: 'Regular practice helps build knowledge',
      items: [{
        suggestedAction: 'Try to practice every day to build a learning streak'
      }]
    };
  } else if (maxStreak === 1) {
    return {
      type: 'streak',
      priority: 'low',
      title: 'Continue your streak',
      description: 'You\'ve started a streak! Keep it going.',
      items: [{
        subject: maxStreakSubject,
        streak: maxStreak,
        suggestedAction: `Come back tomorrow to continue your ${maxStreakSubject} streak`
      }]
    };
  } else {
    return {
      type: 'streak',
      priority: 'low',
      title: 'Maintain your streak',
      description: `You're on a ${maxStreak}-day streak in ${maxStreakSubject}!`,
      items: [{
        subject: maxStreakSubject,
        streak: maxStreak,
        suggestedAction: `Keep your ${maxStreak}-day streak going by practicing ${maxStreakSubject} again tomorrow`
      }]
    };
  }
}

/**
 * Generate difficulty adjustment recommendations
 * @param {Array} performanceData - Array of performance data objects
 * @param {Array} knowledgeMaps - Array of knowledge map objects
 * @returns {Array} - Array of difficulty recommendation objects
 */
function generateDifficultyRecommendations(performanceData, knowledgeMaps) {
  const recommendations = [];
  
  performanceData.forEach(data => {
    const subject = data.subject;
    const accuracy = data.averageAccuracy;
    
    // Check accuracy by complexity if available
    if (data.accuracyByComplexity) {
      const { easy, medium, hard } = data.accuracyByComplexity;
      
      // If easy questions are consistently correct, suggest medium
      if (easy !== null && easy > 85 && data.interactionsByComplexity?.easy > 5) {
        recommendations.push({
          subject,
          currentDifficulty: 'easy',
          suggestedDifficulty: 'medium',
          reason: 'You\'re doing well with easy questions',
          suggestedAction: `Try more medium difficulty ${subject} questions to challenge yourself`
        });
      }
      
      // If medium questions are consistently correct, suggest hard
      if (medium !== null && medium > 80 && data.interactionsByComplexity?.medium > 5) {
        recommendations.push({
          subject,
          currentDifficulty: 'medium',
          suggestedDifficulty: 'hard',
          reason: 'You\'re mastering medium difficulty questions',
          suggestedAction: `Challenge yourself with hard ${subject} questions`
        });
      }
      
      // If hard questions are too difficult, suggest medium
      if (hard !== null && hard < 40 && data.interactionsByComplexity?.hard > 3) {
        recommendations.push({
          subject,
          currentDifficulty: 'hard',
          suggestedDifficulty: 'medium',
          reason: 'Hard questions seem challenging right now',
          suggestedAction: `Focus on medium difficulty ${subject} questions to build confidence`
        });
      }
    } else {
      // General difficulty recommendation based on overall accuracy
      if (accuracy > 85) {
        recommendations.push({
          subject,
          currentDifficulty: 'current',
          suggestedDifficulty: 'higher',
          reason: 'Your accuracy is excellent',
          suggestedAction: `Try more challenging ${subject} questions`
        });
      } else if (accuracy < 40) {
        recommendations.push({
          subject,
          currentDifficulty: 'current',
          suggestedDifficulty: 'lower',
          reason: 'You might benefit from easier questions',
          suggestedAction: `Try some easier ${subject} questions to build confidence`
        });
      }
    }
  });
  
  return recommendations;
}

/**
 * Generate personalized action plan based on all data
 * @param {Array} performanceData - Array of performance data objects
 * @param {Array} knowledgeMaps - Array of knowledge map objects
 * @param {Array} recommendations - Array of recommendation objects
 * @returns {Object} - Personalized action plan
 */
function generateActionPlan(performanceData, knowledgeMaps, recommendations) {
  // Determine focus areas based on recommendations
  const focusAreas = [];
  
  // Add knowledge gaps as focus areas
  const knowledgeGapRec = recommendations.find(r => r.type === 'knowledge_gap');
  if (knowledgeGapRec && knowledgeGapRec.items.length > 0) {
    knowledgeGapRec.items.forEach(item => {
      focusAreas.push({
        type: 'concept',
        subject: item.subject,
        target: item.concept,
        priority: 'high',
        action: item.suggestedAction
      });
    });
  }
  
  // Add subjects to improve as focus areas
  const subjectRec = recommendations.find(r => r.type === 'subject_improvement');
  if (subjectRec && subjectRec.items.length > 0) {
    subjectRec.items.forEach(item => {
      focusAreas.push({
        type: 'subject',
        subject: item.subject,
        target: 'overall_improvement',
        priority: 'medium',
        action: item.suggestedAction
      });
    });
  }
  
  // Create daily and weekly goals
  const dailyGoals = [];
  const weeklyGoals = [];
  
  // Add daily goals based on focus areas
  if (focusAreas.length > 0) {
    // Take top 2 focus areas for daily goals
    focusAreas.slice(0, 2).forEach(area => {
      dailyGoals.push({
        description: area.action,
        type: area.type,
        subject: area.subject,
        target: area.target
      });
    });
  }
  
  // Add streak maintenance as a daily goal
  const streakRec = recommendations.find(r => r.type === 'streak');
  if (streakRec && streakRec.items.length > 0) {
    dailyGoals.push({
      description: streakRec.items[0].suggestedAction,
      type: 'streak',
      subject: streakRec.items[0].subject,
      target: 'streak_maintenance'
    });
  }
  
  // Add weekly goals
  // Include all focus areas for weekly goals
  focusAreas.forEach(area => {
    weeklyGoals.push({
      description: `Improve your understanding of ${area.target} in ${area.subject}`,
      type: area.type,
      subject: area.subject,
      target: area.target
    });
  });
  
  // Add difficulty adjustments as weekly goals
  const difficultyRec = recommendations.find(r => r.type === 'difficulty_adjustment');
  if (difficultyRec && difficultyRec.items.length > 0) {
    difficultyRec.items.forEach(item => {
      weeklyGoals.push({
        description: item.suggestedAction,
        type: 'difficulty',
        subject: item.subject,
        target: 'difficulty_adjustment'
      });
    });
  }
  
  // Create the action plan
  return {
    focusAreas,
    dailyGoals,
    weeklyGoals,
    estimatedCompletionTime: calculateEstimatedCompletionTime(focusAreas),
    adaptiveLevel: calculateAdaptiveLevel(performanceData),
    generatedAt: new Date()
  };
}

/**
 * Calculate estimated completion time for focus areas
 * @param {Array} focusAreas - Array of focus area objects
 * @returns {Object} - Estimated completion time in minutes
 */
function calculateEstimatedCompletionTime(focusAreas) {
  // Base time per focus area
  const baseTimePerArea = 15; // minutes
  
  // Calculate total time based on number and priority of focus areas
  let totalMinutes = 0;
  
  focusAreas.forEach(area => {
    let areaTime = baseTimePerArea;
    
    // Adjust time based on priority
    if (area.priority === 'high') {
      areaTime *= 1.5;
    } else if (area.priority === 'low') {
      areaTime *= 0.7;
    }
    
    totalMinutes += areaTime;
  });
  
  // Cap at reasonable daily study time
  totalMinutes = Math.min(totalMinutes, 120);
  
  return {
    daily: Math.round(totalMinutes),
    weekly: Math.round(totalMinutes * 5) // Assume 5 days of study per week
  };
}

/**
 * Calculate adaptive difficulty level based on performance
 * @param {Array} performanceData - Array of performance data objects
 * @returns {string} - Adaptive difficulty level
 */
function calculateAdaptiveLevel(performanceData) {
  if (!performanceData || performanceData.length === 0) {
    return 'beginner';
  }
  
  // Calculate average accuracy across all subjects
  const totalAccuracy = performanceData.reduce((sum, data) => sum + data.averageAccuracy, 0);
  const averageAccuracy = totalAccuracy / performanceData.length;
  
  // Determine level based on accuracy
  if (averageAccuracy >= 85) {
    return 'advanced';
  } else if (averageAccuracy >= 65) {
    return 'intermediate';
  } else {
    return 'beginner';
  }
}

/**
 * Get personalized learning path for a specific subject
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to generate learning path for
 * @returns {Promise<Object>} - Personalized learning path
 */
export async function getPersonalizedLearningPath(db, userId, subject) {
  try {
    // Get user performance data for the subject
    const performanceData = await getUserPerformanceData(db, userId, subject);
    if (!performanceData || performanceData.length === 0) {
      return {
        success: false,
        message: 'Not enough performance data to generate learning path',
        learningPath: null
      };
    }
    
    // Get user knowledge map for the subject
    const knowledgeMaps = await getUserKnowledgeMaps(db, userId, subject);
    const knowledgeMap = knowledgeMaps.find(map => map.subject === subject);
    
    if (!knowledgeMap) {
      return {
        success: false,
        message: 'No knowledge map available for this subject',
        learningPath: null
      };
    }
    
    // Generate learning path
    const subjectData = performanceData.find(data => data.subject === subject);
    
    // Identify concepts to learn, sorted by dependency and mastery
    const conceptsToLearn = [];
    
    if (knowledgeMap.concepts) {
      // Create a graph of concept dependencies
      const conceptGraph = {};
      
      Object.entries(knowledgeMap.concepts).forEach(([concept, data]) => {
        conceptGraph[concept] = {
          mastery: data.mastery,
          dependencies: [], // Will be filled based on related concepts
          complexity: data.complexity
        };
      });
      
      // Fill in dependencies based on related concepts and mastery
      Object.entries(knowledgeMap.concepts).forEach(([concept, data]) => {
        if (data.relatedConcepts) {
          data.relatedConcepts.forEach(relatedConcept => {
            if (conceptGraph[relatedConcept]) {
              // If the related concept has higher mastery, it might be a prerequisite
              if (knowledgeMap.concepts[relatedConcept].mastery > data.mastery + 20) {
                conceptGraph[concept].dependencies.push(relatedConcept);
              }
            }
          });
        }
      });
      
      // Topological sort to respect dependencies
      const visited = new Set();
      const temp = new Set();
      const order = [];
      
      function visit(concept) {
        if (temp.has(concept)) return; // Cycle detected, skip
        if (visited.has(concept)) return;
        
        temp.add(concept);
        
        conceptGraph[concept].dependencies.forEach(dep => {
          visit(dep);
        });
        
        temp.delete(concept);
        visited.add(concept);
        order.push(concept);
      }
      
      Object.keys(conceptGraph).forEach(concept => {
        if (!visited.has(concept)) {
          visit(concept);
        }
      });
      
      // Convert to learning path items, prioritizing by mastery and complexity
      order.forEach(concept => {
        const conceptData = knowledgeMap.concepts[concept];
        
        // Only include concepts with mastery below 80%
        if (conceptData.mastery < 80) {
          conceptsToLearn.push({
            concept,
            mastery: conceptData.mastery,
            complexity: conceptData.complexity,
            prerequisites: conceptGraph[concept].dependencies
          });
        }
      });
    }
    
    // Create learning path stages
    const stages = [];
    
    // Stage 1: Foundation (concepts with mastery < 40%)
    const foundationConcepts = conceptsToLearn
      .filter(item => item.mastery < 40)
      .sort((a, b) => {
        // Sort by prerequisites first, then by complexity
        const aHasPrereqs = a.prerequisites.length > 0;
        const bHasPrereqs = b.prerequisites.length > 0;
        
        if (aHasPrereqs !== bHasPrereqs) {
          return aHasPrereqs ? 1 : -1; // Concepts without prereqs first
        }
        
        // Then by complexity
        const complexityOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
      });
    
    if (foundationConcepts.length > 0) {
      stages.push({
        name: 'Foundation',
        description: 'Master these fundamental concepts first',
        concepts: foundationConcepts.map(item => item.concept),
        targetMastery: 60,
        estimatedSessions: Math.ceil(foundationConcepts.length / 2)
      });
    }
    
    // Stage 2: Intermediate (concepts with mastery 40-60%)
    const intermediateConcepts = conceptsToLearn
      .filter(item => item.mastery >= 40 && item.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery);
    
    if (intermediateConcepts.length > 0) {
      stages.push({
        name: 'Intermediate',
        description: 'Build on your foundation with these concepts',
        concepts: intermediateConcepts.map(item => item.concept),
        targetMastery: 75,
        estimatedSessions: Math.ceil(intermediateConcepts.length / 2)
      });
    }
    
    // Stage 3: Advanced (concepts with mastery 60-80%)
    const advancedConcepts = conceptsToLearn
      .filter(item => item.mastery >= 60 && item.mastery < 80)
      .sort((a, b) => a.mastery - b.mastery);
    
    if (advancedConcepts.length > 0) {
      stages.push({
        name: 'Advanced',
        description: 'Refine your understanding of these concepts',
        concepts: advancedConcepts.map(item => item.concept),
        targetMastery: 90,
        estimatedSessions: Math.ceil(advancedConcepts.length / 2)
      });
    }
    
    // If no stages were created, add a general improvement stage
    if (stages.length === 0) {
      stages.push({
        name: 'General Improvement',
        description: 'Continue practicing to maintain and improve your knowledge',
        concepts: [],
        targetMastery: 95,
        estimatedSessions: 3
      });
    }
    
    // Create the learning path
    const learningPath = {
      subject,
      currentMastery: knowledgeMap.overallMastery || 0,
      targetMastery: 90,
      stages,
      estimatedCompletionTime: calculatePathCompletionTime(stages),
      adaptiveLevel: calculateAdaptiveLevel([subjectData]),
      generatedAt: new Date()
    };
    
    return {
      success: true,
      learningPath
    };
  } catch (error) {
    console.error('Error generating personalized learning path:', error);
    return {
      success: false,
      message: 'Failed to generate learning path',
      error: error.message
    };
  }
}

/**
 * Calculate estimated completion time for learning path
 * @param {Array} stages - Array of learning path stage objects
 * @returns {Object} - Estimated completion time
 */
function calculatePathCompletionTime(stages) {
  // Base time per session
  const minutesPerSession = 20;
  
  // Calculate total sessions
  const totalSessions = stages.reduce((sum, stage) => sum + stage.estimatedSessions, 0);
  
  // Calculate total time
  const totalMinutes = totalSessions * minutesPerSession;
  
  return {
    sessions: totalSessions,
    minutes: totalMinutes,
    weeks: Math.ceil(totalSessions / 5) // Assuming 5 sessions per week
  };
}

/**
 * Get difficulty adjustment for a specific subject based on performance
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to adjust difficulty for
 * @returns {Promise<Object>} - Difficulty adjustment recommendation
 */
export async function getDifficultyAdjustment(db, userId, subject) {
  try {
    // Get user performance data for the subject
    const performanceData = await getUserPerformanceData(db, userId, subject);
    if (!performanceData || performanceData.length === 0) {
      return {
        success: false,
        message: 'Not enough performance data to determine difficulty adjustment',
        adjustment: null
      };
    }
    
    const subjectData = performanceData.find(data => data.subject === subject);
    if (!subjectData) {
      return {
        success: false,
        message: 'No performance data found for this subject',
        adjustment: null
      };
    }
    
    // Determine current difficulty level
    let currentDifficulty = 'medium';
    let targetDifficulty = 'medium';
    let reason = '';
    
    // Check if we have complexity-specific data
    if (subjectData.accuracyByComplexity) {
      const { easy, medium, hard } = subjectData.accuracyByComplexity;
      const interactionsByComplexity = subjectData.interactionsByComplexity || { easy: 0, medium: 0, hard: 0 };
      
      // Determine current difficulty based on most interactions
      if (interactionsByComplexity.easy > interactionsByComplexity.medium && 
          interactionsByComplexity.easy > interactionsByComplexity.hard) {
        currentDifficulty = 'easy';
      } else if (interactionsByComplexity.hard > interactionsByComplexity.medium && 
                 interactionsByComplexity.hard > interactionsByComplexity.easy) {
        currentDifficulty = 'hard';
      }
      
      // Determine target difficulty based on accuracy
      if (currentDifficulty === 'easy' && easy !== null && easy > 85 && interactionsByComplexity.easy > 5) {
        targetDifficulty = 'medium';
        reason = 'You\'re performing very well on easy questions';
      } else if (currentDifficulty === 'medium' && medium !== null) {
        if (medium > 80 && interactionsByComplexity.medium > 5) {
          targetDifficulty = 'hard';
          reason = 'You\'re ready for more challenging questions';
        } else if (medium < 40 && interactionsByComplexity.medium > 5) {
          targetDifficulty = 'easy';
          reason = 'Building a stronger foundation will help you progress';
        }
      } else if (currentDifficulty === 'hard' && hard !== null && hard < 40 && interactionsByComplexity.hard > 3) {
        targetDifficulty = 'medium';
        reason = 'Medium difficulty questions will help you build confidence';
      }
    } else {
      // Use overall accuracy if complexity-specific data is not available
      const accuracy = subjectData.averageAccuracy;
      
      if (accuracy > 85) {
        targetDifficulty = 'hard';
        reason = 'Your high accuracy shows you\'re ready for more challenges';
      } else if (accuracy < 40) {
        targetDifficulty = 'easy';
        reason = 'Starting with easier questions will help build your confidence';
      }
    }
    
    // Create adjustment object
    const adjustment = {
      subject,
      currentDifficulty,
      targetDifficulty,
      reason,
      change: currentDifficulty !== targetDifficulty,
      direction: targetDifficulty === currentDifficulty ? 'maintain' : 
                (targetDifficulty === 'hard' ? 'increase' : 
                (targetDifficulty === 'easy' ? 'decrease' : 'adjust')),
      generatedAt: new Date()
    };
    
    return {
      success: true,
      adjustment
    };
  } catch (error) {
    console.error('Error determining difficulty adjustment:', error);
    return {
      success: false,
      message: 'Failed to determine difficulty adjustment',
      error: error.message
    };
  }
}

/**
 * Identify knowledge gaps and strengths for a user
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Knowledge gaps and strengths
 */
export async function identifyKnowledgeInsights(db, userId) {
  try {
    // Get all knowledge maps for the user
    const knowledgeMaps = await getUserKnowledgeMaps(db, userId);
    if (!knowledgeMaps || knowledgeMaps.length === 0) {
      return {
        success: false,
        message: 'Not enough knowledge data to identify insights',
        insights: null
      };
    }
    
    // Identify knowledge gaps
    const gaps = identifyKnowledgeGaps(knowledgeMaps);
    
    // Identify strengths
    const strengths = identifyStrengths(knowledgeMaps);
    
    // Group gaps and strengths by subject
    const subjectGaps = {};
    const subjectStrengths = {};
    
    gaps.forEach(gap => {
      if (!subjectGaps[gap.subject]) {
        subjectGaps[gap.subject] = [];
      }
      subjectGaps[gap.subject].push(gap);
    });
    
    strengths.forEach(strength => {
      if (!subjectStrengths[strength.subject]) {
        subjectStrengths[strength.subject] = [];
      }
      subjectStrengths[strength.subject].push(strength);
    });
    
    // Create insights object
    const insights = {
      gaps: {
        total: gaps.length,
        bySubject: subjectGaps,
        top: gaps.slice(0, 5)
      },
      strengths: {
        total: strengths.length,
        bySubject: subjectStrengths,
        top: strengths.slice(0, 5)
      },
      generatedAt: new Date()
    };
    
    return {
      success: true,
      insights
    };
  } catch (error) {
    console.error('Error identifying knowledge insights:', error);
    return {
      success: false,
      message: 'Failed to identify knowledge insights',
      error: error.message
    };
  }
}