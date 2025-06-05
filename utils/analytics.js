// Analytics utilities for tracking user interactions

/**
 * Track user interaction with the chat system
 * @param {object} db - Firestore database instance
 * @param {object} interaction - Interaction data to track
 * @returns {Promise<string>} - The ID of the tracked interaction
 */
export async function trackUserInteraction(db, interaction) {
  try {
    if (!db) {
      console.log('Skipping interaction tracking - no database provided');
      return `mock_interaction_${Date.now()}`;
    }
    
    const { userId, agentId, content, response, subject, isQuestion, xpEarned } = interaction;
    
    if (!userId || !content) {
      console.error('Missing required fields for tracking interaction');
      return `invalid_interaction_${Date.now()}`;
    }
    
    // Create a new interaction document
    const interactionData = {
      userId,
      agentId: agentId || '1',
      content: content.substring(0, 500), // Limit content length
      responsePreview: response ? response.substring(0, 100) + '...' : 'No response',
      subject: subject || 'general',
      isQuestion: isQuestion || false,
      xpEarned: xpEarned || 0,
      timestamp: new Date(),
      // Additional analytics data
      contentLength: content.length,
      responseLength: response ? response.length : 0,
      processingTime: interaction.processingTime || 0,
      attemptCount: interaction.attemptCount || 1
    };
    
    // Add to interactions collection
    const interactionsRef = db.collection('user_interactions');
    const docRef = await interactionsRef.add(interactionData);
    
    console.log(`✅ Tracked interaction: ${docRef.id}`);
    
    // If this is a question, update user performance data
    if (isQuestion) {
      try {
        await updateUserPerformance(db, userId, subject, xpEarned);
      } catch (perfError) {
        console.error('Error updating user performance:', perfError);
        // Continue even if performance update fails
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    return `error_interaction_${Date.now()}`;
  }
}

/**
 * Update user performance metrics based on interaction
 * @param {object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject of the interaction
 * @param {number} xpEarned - XP earned in this interaction
 */
async function updateUserPerformance(db, userId, subject, xpEarned) {
  try {
    // Get or create user performance document
    const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);
    const performanceDoc = await performanceRef.get();
    
    if (!performanceDoc.exists) {
      // Create new performance document if it doesn't exist
      await performanceRef.set({
        userId,
        subject,
        totalXP: xpEarned,
        interactionCount: 1,
        questionCount: 1,
        averageAccuracy: 100, // Default to 100% initially
        progress: 5, // Start with 5% progress
        status: 'beginner',
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    } else {
      // Update existing performance document
      const performanceData = performanceDoc.data();
      
      // Calculate new values
      const newInteractionCount = (performanceData.interactionCount || 0) + 1;
      const newQuestionCount = (performanceData.questionCount || 0) + 1;
      const newTotalXP = (performanceData.totalXP || 0) + xpEarned;
      
      // Calculate progress (capped at 100%)
      const newProgress = Math.min(
        100, 
        performanceData.progress + (xpEarned / 100) // Each 100 XP is roughly 1% progress
      );
      
      // Determine status based on progress
      let newStatus = performanceData.status || 'beginner';
      if (newProgress >= 90) newStatus = 'expert';
      else if (newProgress >= 70) newStatus = 'advanced';
      else if (newProgress >= 40) newStatus = 'intermediate';
      
      // Update the document
      await performanceRef.update({
        totalXP: newTotalXP,
        interactionCount: newInteractionCount,
        questionCount: newQuestionCount,
        progress: newProgress,
        status: newStatus,
        lastUpdated: new Date()
      });
    }
    
    console.log(`✅ Updated performance for user ${userId} in ${subject}`);
  } catch (error) {
    console.error('Error updating user performance:', error);
    throw error;
  }
}