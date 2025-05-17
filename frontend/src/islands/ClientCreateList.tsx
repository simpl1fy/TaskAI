import React from 'react';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import CreateList from '@/components/dashboard/CreateList';

const ClientCreateList = () => {
  return (
    <ClerkProviderWrapper>
      <CreateList />
    </ClerkProviderWrapper>
  )
}

export default ClientCreateList
