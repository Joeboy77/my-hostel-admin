import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';

const BookingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Bookings</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage property bookings and reservations</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-foreground">Bookings</h2>
            <p className="text-muted-foreground mt-2">Booking management functionality will be implemented here.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingsPage; 