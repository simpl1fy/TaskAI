import React from 'react';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import TaskList from '@/components/dashboard/TaskList';
import AITextArea from '@/components/dashboard/AITextArea';

const ClientDashboard = () => {
  return (
    <ClerkProviderWrapper>
      <section className='mb-5'>
        <AITextArea />
      </section>
      <section>
        <TaskList />
      </section>
    </ClerkProviderWrapper>
  )
}

export default ClientDashboard;
