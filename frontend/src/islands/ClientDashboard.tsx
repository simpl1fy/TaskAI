import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';
import Home from '@/components/dashboard/main_screens/home_page/home';
import Analytics from '@/components/dashboard/main_screens/analytics_page/analytics';
import Study from '@/components/dashboard/main_screens/study_page/study';
import Settings from '@/components/dashboard/main_screens/settings_page/settings';
import Sidebar from './Sidebar';
import { useState } from 'react';

const ClientDashboard = () => {

  const [activeScreen, setActiveScreen] = useState<String>("home");
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <ClerkProviderWrapper>
      <div className={`grid h-screen transition-[grid-template-columns] duration-300 ease-in-out`}
        style={{ gridTemplateColumns: collapsed ? "4rem 1fr": "16rem 1fr"}}
      >
        <aside className='h-screen'>
          <Sidebar setActiveScreen={setActiveScreen} collapsed={collapsed} setCollapsed={setCollapsed} />
        </aside>
        <section className='overflow-y-auto'>
          {activeScreen === "home" && <Home />}
          {activeScreen === "analytics" && <Analytics />}
          {activeScreen === "study" && <Study />}
          {activeScreen === "settings" && <Settings />}
        </section>
      </div>
    </ClerkProviderWrapper>
  )
}

export default ClientDashboard;
