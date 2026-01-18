import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );
};

export default Loading;