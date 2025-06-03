// ...existing code...

const sendMessage = async (message: string, agentId: number) => {
  let attempt = 0;
  const maxAttempts = 3;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`Sending chat message to API (attempt ${attempt}/${maxAttempts})`);
      
      const response = await queryClient.post('/api/chat', {
        content: message,
        agentId,
        userId: user?.id
      });

      if (!response.ok) {
        throw new Error(`Chat API returned error status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};

// ...existing code...
