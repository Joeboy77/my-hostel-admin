import React from 'react';
import { Menu } from 'lucide-react';

interface MobileMenuButtonProps {
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
      title="Open menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
};

export default MobileMenuButton; 