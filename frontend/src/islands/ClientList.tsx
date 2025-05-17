import React from 'react';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import TaskList from '@/components/dashboard/TaskList';

const ClientList = () => {
  return (
    <ClerkProviderWrapper>
      <TaskList />
    </ClerkProviderWrapper>
  )
}

export default ClientList
