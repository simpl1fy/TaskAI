import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useAuth } from '@clerk/clerk-react';

const AITextArea = () => {
  
  const { getToken } = useAuth();

  const [prompt, setPrompt] = useState("");

  const handleGenerate = async() => {
    try {
      const token = await getToken();

      const response = await fetch("http://localhost:3000/api/ai", {
        method: "POST",
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      const resData = await response.json();
      if(resData.success) {
        console.log(resData);
        setPrompt("");
      }
    } catch(err) {
      console.error("An error occured while generating your tasks =", err);
    }
  }

  return (
    <div className='border border-gray-200 rounded-md p-5 bg-white'>
      <Textarea placeholder='Ask AI generate tasks for you. Here is an example prompt - "Generate 5 procedural tasks for me learning python"' value={prompt} onChange={(e) => setPrompt(e.target.value)} className='mb-3' />

      <div className='flex gap-2'>
        <Button className='bg-violet-700 hover:bg-violet-800 transition cursor-pointer' onClick={handleGenerate}>+ Generate Tasks</Button>
        <Button className='bg-gray-200 hover:bg-gray-300 transition text-black cursor-pointer'>Clear</Button>
      </div>
    </div>
  )
}

export default AITextArea
