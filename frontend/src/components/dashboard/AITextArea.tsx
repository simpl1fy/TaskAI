import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const AITextArea = () => {

  const [prompt, setPrompt] = useState("");

  return (
    <div className='border border-gray-200 rounded-md p-5'>
      <Textarea placeholder='Ask AI generate tasks for you. Here is an example prompt - "Generate 5 procedural tasks for me learning python"' value={prompt} onChange={(e) => setPrompt(e.target.value)} className='mb-3' />

      <div className='flex gap-2'>
        <Button className='bg-violet-700 hover:bg-violet-800 transition cursor-pointer'>+ Generate Tasks</Button>
        <Button className='bg-gray-200 hover:bg-gray-300 transition text-black cursor-pointer'>Clear</Button>
      </div>
    </div>
  )
}

export default AITextArea
