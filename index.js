import 'dotenv/config';
import Openai from 'openai';
const openai = new Openai();

const aiResult = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: 'you are an ai assistant',
    },
    {
      role: 'user',
      content: 'what is the weather like today?',
    },
  ],
});

console.log(aiResult.choices[0].message);
