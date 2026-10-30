/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { QuickInputModal } from './components/modals/QuickInputModal';
import { DataMigrationModal } from './components/modals/DataMigrationModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SavingsPage } from './pages/SavingsPage';
import { DebtsPage } from './pages/DebtsPage';
import { MonthlyTargetsPage } from './pages/MonthlyTargetsPage';
import { MonthlySummaryPage } from './pages/MonthlySummaryPage';
import { ReportsPage } from './pages/ReportsPage';
import { YearlyPage } from './pages/YearlyPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isQuickInputOpen, setIsQuickInputOpen] = useState(false);
  const [quickInputInitialTab, setQuickInputInitialTab] = useState<'chat' | 'voice' | 'camera' | 'manual'>('chat');
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  const handleOpenQuickInput = (tab: 'chat' | 'voice' | 'camera' | 'manual' = 'chat') => {
    setQuickInputInitialTab(tab);
    setIsQuickInputOpen(true);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenQuickInput={handleOpenQuickInput}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenMigration={() => setIsMigrationOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            onOpenQuickInput={() => handleOpenQuickInput('manual')}
            onOpenMigration={() => setIsMigrationOpen(true)}
          />
        );
      case 'accounts':
        return <AccountsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'savings':
        return <SavingsPage />;
      case 'debts':
        return <DebtsPage />;
      case 'monthly-targets':
        return <MonthlyTargetsPage />;
      case 'monthly-summary':
        return <MonthlySummaryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'yearly':
        return <YearlyPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onOpenQuickInput={handleOpenQuickInput}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenMigration={() => setIsMigrationOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg-main))] text-[hsl(var(--text-main))] selection:bg-mint-brand/20">
      {/* Desktop Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header with Month picker, Alerts popover & Quick Add */}
        <Header
          onOpenQuickInput={() => handleOpenQuickInput('chat')}
          onOpenDataMigration={() => setIsMigrationOpen(true)}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
        />

        {/* Scrollable Page Body max-w-[1440px] */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-6 pb-24 lg:pb-12">
          {renderActivePage()}
        </main>

        {/* Mobile Glass Bottom Navigation */}
        <BottomNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
      </div>

      {/* Multimodal Transaction Input Modal (Chat WA, Voice Note, Struk OCR, Manual Form) */}
      <QuickInputModal
        isOpen={isQuickInputOpen}
        onClose={() => setIsQuickInputOpen(false)}
        initialTab={quickInputInitialTab}
      />

      {/* Old App Data Migration Modal */}
      <DataMigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
