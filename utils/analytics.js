// Analytics utilities for tracking user interactions
import { collection, doc, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';

/**
 * Track user interaction with the chat system
 * @param {object} db - Firestore database instance
 * @param {object} interaction - Interaction data to track
 * @returns {Promise<string>} - The ID of the tracked interaction
 */
export async function trackUserInteraction(db, userId, interaction) {
  try {
    if (!db) {
      console.log('Skipping interaction tracking - no database provided');
      return `mock_interaction_${Date.now()}`;
    }
    
    const { agentId, content, type, timestamp } = interaction;
    
    if (!userId || !content) {
      console.error('Missing required fields for tracking interaction');
      return `invalid_interaction_${Date.now()}`;
    }
    
    // Create a new interaction document
    const interactionData = {
      userId,
      agentId: agentId || '1',
      content: content.substring(0, 500), // Limit content length
      type: type || 'chat_message',
      timestamp: timestamp || new Date().toISOString(),
      // Additional analytics data
      contentLength: content.length
    };
    
    // Add to interactions collection
    const interactionsRef = collection(db, 'user_interactions');
    const docRef = await addDoc(interactionsRef, interactionData);
    
    console.log(`✅ Tracked interaction: ${docRef.id}`);
    
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
export async function updateUserPerformance(db, userId, subject, xpEarned) {
  try {
    if (!db) {
      console.log('Skipping performance update - no database provided');
      return;
    }
    
    // Get or create user performance document
    const performanceRef = doc(db, 'user_performance', `${userId}_${subject}`);
    const performanceDoc = await getDoc(performanceRef);
    
    if (!performanceDoc.exists()) {
      // Create new performance document if it doesn't exist
      await setDoc(performanceRef, {
        userId,
        subject,
        totalXP: xpEarned || 0,
        interactionCount: 1,
        questionCount: 1,
        averageAccuracy: 100, // Default to 100% initially
        progress: 5, // Start with 5% progress
        status: 'beginner',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } else {
      // Update existing performance document
      const performanceData = performanceDoc.data();
      
      // Calculate new values
      const newInteractionCount = (performanceData.interactionCount || 0) + 1;
      const newQuestionCount = (performanceData.questionCount || 0) + 1;
      const newTotalXP = (performanceData.totalXP || 0) + (xpEarned || 0);
      
      // Calculate progress (capped at 100%)
      const newProgress = Math.min(
        100, 
        (performanceData.progress || 0) + ((xpEarned || 0) / 100) // Each 100 XP is roughly 1% progress
      );
      
      // Determine status based on progress
      let newStatus = performanceData.status || 'beginner';
      if (newProgress >= 90) newStatus = 'expert';
      else if (newProgress >= 70) newStatus = 'advanced';
      else if (newProgress >= 40) newStatus = 'intermediate';
      
      // Update the document
      await updateDoc(performanceRef, {
        totalXP: newTotalXP,
        interactionCount: newInteractionCount,
        questionCount: newQuestionCount,
        progress: newProgress,
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
    }
    
    console.log(`✅ Updated performance for user ${userId} in ${subject}`);
  } catch (error) {
    console.error('Error updating user performance:', error);
    // Don't throw the error to prevent API failures
  }
}