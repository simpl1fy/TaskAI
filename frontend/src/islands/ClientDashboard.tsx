import { useState } from 'react';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import TaskList from '@/components/dashboard/TaskList';
import AITextArea from '@/components/dashboard/AITextArea';

const ClientDashboard = () => {

  const [isUpdated, setIsUpdated] = useState(false);
  return (
    <ClerkProviderWrapper>
      <div className='bg-violet-100 p-5'>
        <section className='mb-5'>
          <AITextArea setListUpdated={setIsUpdated} />
        </section>
        <section>
          <TaskList listUpdated={isUpdated} setListUpdated={setIsUpdated}  />
        </section>
      </div>
    </ClerkProviderWrapper>
  )
}

export default ClientDashboard;
