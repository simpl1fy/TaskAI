import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const AITextArea = () => {

  const [prompt, setPrompt] = useState("");

  return (
    <div className='border border-gray-200 rounded-md p-5'>
      <Textarea placeholder='Ask AI generate tasks for you. Here is an example prompt - "Generate 5 procedural tasks for me learning python"' value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      <div className='flex gap-2'>
        <Button className=''>+ Generate Tasks</Button>
      </div>
    </div>
  )
}

export default AITextArea
