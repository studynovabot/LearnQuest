// Fix for chat response parsing issue
// The API returns: { success: true, data: { message: "..." } }
// But the frontend is looking for: assistantMessage.content or assistantMessage.response

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/hooks/useChat.ts');

// Read the current file
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the response parsing logic
const oldLogic = `            // Check for different possible response formats
            if (typeof assistantMessage.content === 'string' && assistantMessage.content.trim() !== '') {
              messageContent = assistantMessage.content;
            } else if (typeof assistantMessage.response === 'string' && assistantMessage.response.trim() !== '') {
              messageContent = assistantMessage.response;
            } else if (typeof assistantMessage === 'string' && assistantMessage.trim() !== '') {
              // Handle case where the entire response is a string
              messageContent = assistantMessage;
            } else {
              // Default fallback message
              messageContent = "I'm sorry, I couldn't generate a response this time. Please try asking something else.";
            }`;

const newLogic = `            // Check for different possible response formats
            if (typeof assistantMessage.content === 'string' && assistantMessage.content.trim() !== '') {
              messageContent = assistantMessage.content;
            } else if (typeof assistantMessage.response === 'string' && assistantMessage.response.trim() !== '') {
              messageContent = assistantMessage.response;
            } else if (assistantMessage.data && typeof assistantMessage.data.message === 'string' && assistantMessage.data.message.trim() !== '') {
              // Handle API response format: { success: true, data: { message: "..." } }
              messageContent = assistantMessage.data.message;
            } else if (typeof assistantMessage === 'string' && assistantMessage.trim() !== '') {
              // Handle case where the entire response is a string
              messageContent = assistantMessage;
            } else {
              // Default fallback message
              console.warn('Could not extract message content from response:', assistantMessage);
              messageContent = "I'm sorry, I couldn't generate a response this time. Please try asking something else.";
            }`;

// Replace the logic
const newContent = content.replace(oldLogic, newLogic);

if (newContent !== content) {
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ Fixed chat response parsing logic in useChat.ts');
  console.log('🔧 Added support for API response format: { data: { message: "..." } }');
} else {
  console.log('❌ Could not find the target code section to replace');
  console.log('The file might have been modified or the search pattern needs adjustment');
}