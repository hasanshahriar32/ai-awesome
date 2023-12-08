import { openai } from './openai.js';

import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const newMessage = async (history, message) => {
  const results = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [...history, message],
  });
  return results.choices[0].message;
};

const formatMessage = (userInput) => ({ role: 'user', content: userInput });

const chat = async () => {
  const history = [{ role: 'system', content: 'you are an ai assistant' }];
  const start = () => {
    rl.question('You: ', async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      const message = formatMessage(userInput);
      const response = await newMessage(history, message);
      history.push(message, response);
      console.log('\nAI: ', response.content, '\n\n');
      start();
    });
  };
  start();
};
console.log("Chatbot initialized. Type 'exit' to quit.");
chat();
