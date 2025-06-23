// Fix for chat message spread issue
// The problem is ...assistantMessage is overwriting the content field

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/hooks/useChat.ts');

// Read the current file
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the message creation logic
const oldLogic = `            // Add the assistant's response to local state
            setLocalMessages((prev) => [...prev, {
              ...assistantMessage,
              content: messageContent, // Use the validated/fallback content
              timestamp: assistantMessage.timestamp || Date.now()
            }]);`;

const newLogic = `            // Add the assistant's response to local state
            setLocalMessages((prev) => [...prev, {
              id: Date.now(),
              content: messageContent, // Use the validated/fallback content
              role: 'assistant',
              timestamp: assistantMessage.timestamp || Date.now()
            }]);`;

// Replace the logic
const newContent = content.replace(oldLogic, newLogic);

if (newContent !== content) {
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ Fixed chat message spread issue in useChat.ts');
  console.log('🔧 Removed ...assistantMessage spread that was overwriting content');
} else {
  console.log('❌ Could not find the target code section to replace');
  console.log('The file might have been modified or the search pattern needs adjustment');
}