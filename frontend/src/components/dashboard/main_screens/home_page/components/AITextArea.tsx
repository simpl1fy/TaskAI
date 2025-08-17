import { useState } from 'react';
import { Textarea } from '../../../../ui/textarea';
import { Button } from '../../../../ui/button';
import { useAuth } from '@clerk/clerk-react';
import CreateList from './CreateList';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Dispatch, SetStateAction, KeyboardEvent } from 'react';

type ResponseData = {
  listTitle: string;
  tasks: string[];
}

const AITextArea = ({ setListUpdated }: { setListUpdated: Dispatch<SetStateAction<boolean>>}) => {
  
  const { getToken } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState<ResponseData>();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGenerate = async() => {
    setLoading(true);
    if(prompt.trim().length == 0) {
      toast.error("Prompt cannot be empty!");
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/ai`, {
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
        setData(resData.parsedData);
        toast.success(resData.message);
        setPrompt("");
        setModalOpen(true);
      } else {
        setPrompt("");
        toast.error(resData.message);
      }
      setLoading(false);
    } catch(err) {
      console.error("An error occured while generating your tasks =", err);
      setLoading(false);
    }
  }

  const handleClear = () => setPrompt("");

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if(event.key === "Enter") {
      event.preventDefault();
      handleGenerate();
    }
    else if(event.key === "Escape") {
      handleClear();
    }
  }
  

  return (
    <div className="border border-gray-200 rounded-md p-5 bg-white w-full shadow-md">
      <Textarea
        placeholder='Ask AI to generate tasks for you. Example: "Generate 5 procedural tasks for learning Python."'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="mb-3"
        onKeyDown={handleKeyDown}
      />
  
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          className="bg-violet-700 hover:bg-violet-800 transition cursor-pointer w-full sm:w-auto"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <span className='flex gap-4 items-center'>+ Generate Tasks </span>
          )}
        </Button>
  
        <Button
          className="bg-gray-200 hover:bg-gray-300 transition text-black cursor-pointer w-full sm:w-auto"
          onClick={handleClear}
        >
          <span className='felx gap-4 items-center'>Clear <kbd className='text-xs'>esc</kbd></span>
        </Button>
      </div>
  
      <CreateList
        isUpdated={setListUpdated}
        open={modalOpen}
        setOpen={setModalOpen}
        listTitle={data?.listTitle}
        taskArray={data?.tasks}
      />
    </div>
  )  
}

export default AITextArea
