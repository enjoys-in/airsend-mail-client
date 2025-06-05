import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';

const AutoReplySection = () => {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-2">Auto-reply</h2>
      <p className="text-gray-400 mb-6">
        Set automatic replies to inform senders you are out of the office or unable to respond.
      </p>

      <div className="flex items-center gap-3">
        <span className="font-medium">Auto-reply</span>
        <Switch
          checked={autoReplyEnabled}
          onCheckedChange={setAutoReplyEnabled}
          aria-label="Toggle auto-reply"
        />
      </div>
    </div>
  );
};

export default AutoReplySection;