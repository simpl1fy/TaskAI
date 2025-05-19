import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useAuth } from '@clerk/clerk-react';
import CreateList from './CreateList';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { Dispatch, SetStateAction } from 'react';

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

  return (
    <div className="border border-gray-200 rounded-md p-5 bg-white w-full max-w-6xl mx-auto">
      <Textarea
        placeholder='Ask AI to generate tasks for you. Example: "Generate 5 procedural tasks for learning Python."'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="mb-3"
      />
  
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          className="bg-violet-700 hover:bg-violet-800 transition cursor-pointer w-full sm:w-auto"
          onClick={handleGenerate}
        >
          {loading ? (
            <Loader className="animate-spin" />
          ) : (
            <span>+ Generate Tasks</span>
          )}
        </Button>
  
        <Button
          className="bg-gray-200 hover:bg-gray-300 transition text-black cursor-pointer w-full sm:w-auto"
          onClick={() => setPrompt("")}
        >
          Clear
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
