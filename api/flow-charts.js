// Vercel serverless function for flow charts
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Sample flow charts data
const FLOW_CHARTS_DATA = [
  {
    id: 'fc_photosynthesis',
    title: 'Photosynthesis Process',
    description: 'Step-by-step process of how plants make their food',
    subject: 'Science',
    class: '7',
    chapter: 'Nutrition in Plants',
    difficulty: 'medium',
    estimatedTime: 15,
    steps: [
      {
        id: 'step1',
        title: 'Raw Materials Collection',
        description: 'Plants absorb carbon dioxide from air through stomata and water from soil through roots',
        isCompleted: false,
        connections: ['step2']
      },
      {
        id: 'step2',
        title: 'Chlorophyll Activation',
        description: 'Chlorophyll in leaves absorbs sunlight energy and gets activated',
        isCompleted: false,
        connections: ['step3']
      },
      {
        id: 'step3',
        title: 'Chemical Reaction',
        description: 'CO₂ + H₂O + Sunlight Energy → Glucose + Oxygen (in presence of chlorophyll)',
        isCompleted: false,
        connections: ['step4']
      },
      {
        id: 'step4',
        title: 'Product Formation',
        description: 'Glucose is stored as food for the plant, oxygen is released into atmosphere',
        isCompleted: false,
        connections: []
      }
    ]
  },
  {
    id: 'fc_linear_equations',
    title: 'Solving Linear Equations',
    description: 'Step-by-step method to solve linear equations in one variable',
    subject: 'Mathematics',
    class: '8',
    chapter: 'Linear Equations',
    difficulty: 'easy',
    estimatedTime: 12,
    steps: [
      {
        id: 'step1',
        title: 'Identify the Equation',
        description: 'Write the equation in standard form ax + b = c, where a ≠ 0',
        isCompleted: false,
        connections: ['step2']
      },
      {
        id: 'step2',
        title: 'Isolate Variable Terms',
        description: 'Move all terms containing the variable to one side of the equation',
        isCompleted: false,
        connections: ['step3']
      },
      {
        id: 'step3',
        title: 'Isolate Constants',
        description: 'Move all constant terms to the other side of the equation',
        isCompleted: false,
        connections: ['step4']
      },
      {
        id: 'step4',
        title: 'Solve for Variable',
        description: 'Divide both sides by the coefficient of the variable to get x = value',
        isCompleted: false,
        connections: ['step5']
      },
      {
        id: 'step5',
        title: 'Verify Solution',
        description: 'Substitute the value back into the original equation to check if both sides are equal',
        isCompleted: false,
        connections: []
      }
    ]
  },
  {
    id: 'fc_water_cycle',
    title: 'Water Cycle Process',
    description: 'Complete process of water circulation in nature',
    subject: 'Geography',
    class: '6',
    chapter: 'Our Earth',
    difficulty: 'easy',
    estimatedTime: 18,
    steps: [
      {
        id: 'step1',
        title: 'Evaporation',
        description: 'Sun heats water in oceans, rivers, and lakes, converting it to water vapor',
        isCompleted: false,
        connections: ['step2']
      },
      {
        id: 'step2',
        title: 'Transpiration',
        description: 'Plants release water vapor through their leaves into the atmosphere',
        isCompleted: false,
        connections: ['step3']
      },
      {
        id: 'step3',
        title: 'Condensation',
        description: 'Water vapor rises, cools down, and condenses to form tiny water droplets (clouds)',
        isCompleted: false,
        connections: ['step4']
      },
      {
        id: 'step4',
        title: 'Precipitation',
        description: 'Water droplets in clouds combine and fall as rain, snow, or hail',
        isCompleted: false,
        connections: ['step5']
      },
      {
        id: 'step5',
        title: 'Collection',
        description: 'Precipitated water collects in water bodies or seeps into ground, cycle repeats',
        isCompleted: false,
        connections: []
      }
    ]
  },
  {
    id: 'fc_digestion',
    title: 'Human Digestive Process',
    description: 'Journey of food through the human digestive system',
    subject: 'Science',
    class: '7',
    chapter: 'Nutrition in Animals',
    difficulty: 'medium',
    estimatedTime: 20,
    steps: [
      {
        id: 'step1',
        title: 'Ingestion',
        description: 'Food enters through mouth, teeth break it down, saliva begins digestion',
        isCompleted: false,
        connections: ['step2']
      },
      {
        id: 'step2',
        title: 'Stomach Processing',
        description: 'Food reaches stomach, gastric juices break down proteins',
        isCompleted: false,
        connections: ['step3']
      },
      {
        id: 'step3',
        title: 'Small Intestine',
        description: 'Most digestion and absorption occurs here with help of bile and pancreatic juice',
        isCompleted: false,
        connections: ['step4']
      },
      {
        id: 'step4',
        title: 'Large Intestine',
        description: 'Water absorption and formation of waste material',
        isCompleted: false,
        connections: ['step5']
      },
      {
        id: 'step5',
        title: 'Egestion',
        description: 'Undigested waste is eliminated from the body',
        isCompleted: false,
        connections: []
      }
    ]
  }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        const { class: classNum, subject, id } = req.query;
        const userId = req.headers['x-user-id'] || 'demo-user';

        try {
          console.log('📊 Flow Charts: Fetching flow charts...');

          // For now, use hardcoded data to avoid Firestore index issues
          // In production, you would set up proper Firestore indexes

          // If specific flow chart ID is requested
          if (id) {
            const flowChart = FLOW_CHARTS_DATA.find(fc => fc.id === id);
            if (flowChart) {
              console.log(`📊 Flow Charts: Found chart ${id}`);
              return res.status(200).json(flowChart);
            } else {
              return res.status(404).json({ message: 'Flow chart not found' });
            }
          }

          // Filter hardcoded data based on query parameters
          let filteredCharts = FLOW_CHARTS_DATA;

          if (classNum) {
            filteredCharts = filteredCharts.filter(chart => chart.class === classNum);
          }

          if (subject) {
            filteredCharts = filteredCharts.filter(chart => chart.subject === subject);
          }

          console.log(`📊 Flow Charts: Returning ${filteredCharts.length} charts`);
          res.status(200).json(filteredCharts);

        } catch (error) {
          console.error('Error fetching flow charts:', error);
          res.status(500).json({ message: 'Failed to fetch flow charts', error: error.message });
        }

      } else if (req.method === 'POST') {
        // Track flow chart progress or completion
        const { chartId, stepId, action, timeSpent } = req.body;
        const userId = req.headers['x-user-id'] || 'demo-user';

        if (!chartId || !action) {
          return res.status(400).json({ message: 'Chart ID and action are required' });
        }

        try {
          // Record the interaction
          await db.collection('flow_chart_progress').add({
            userId,
            chartId,
            stepId: stepId || null,
            action, // 'step_completed', 'chart_completed', 'chart_started'
            timeSpent: timeSpent || 0,
            timestamp: new Date()
          });

          let xpEarned = 0;

          // Award XP based on action
          switch (action) {
            case 'step_completed':
              xpEarned = 5;
              break;
            case 'chart_completed':
              xpEarned = 25;
              break;
            case 'chart_started':
              xpEarned = 2;
              break;
            default:
              xpEarned = 0;
          }

          // Update user's XP if earned
          if (xpEarned > 0) {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
              const currentXP = userDoc.data().xp || 0;
              await userRef.update({
                xp: currentXP + xpEarned,
                lastActivity: new Date()
              });
            }
          }

          res.status(200).json({
            message: 'Progress recorded successfully',
            xpEarned
          });

        } catch (error) {
          console.error('Error recording flow chart progress:', error);
          res.status(500).json({ message: 'Failed to record progress' });
        }

      } else if (req.method === 'PUT') {
        // Update flow chart step completion status
        const { chartId, stepId, isCompleted } = req.body;
        const userId = req.headers['x-user-id'] || 'demo-user';

        if (!chartId || !stepId) {
          return res.status(400).json({ message: 'Chart ID and step ID are required' });
        }

        try {
          // In a real implementation, you would update the user's progress in the database
          // For now, we'll just acknowledge the update

          await db.collection('user_flow_chart_progress').doc(`${userId}_${chartId}_${stepId}`).set({
            userId,
            chartId,
            stepId,
            isCompleted: isCompleted || false,
            completedAt: isCompleted ? new Date() : null,
            updatedAt: new Date()
          }, { merge: true });

          res.status(200).json({
            message: 'Step status updated successfully'
          });

        } catch (error) {
          console.error('Error updating step status:', error);
          res.status(500).json({ message: 'Failed to update step status' });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Flow charts error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
