"use client"
import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader, Paperclip, Image } from "lucide-react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");

  };
  useEffect(() => {
    scrollToBottom();
  }, []);
  return (

    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 ml-2">
            <h2 className="text-lg font-semibold text-white"># general</h2>
          </div>
          <div>
            <button className="rounded-full hover:bg-secondary" onClick={() => setIsLoading(!isLoading)}>
              <InfoCircledIcon className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
      {hasNewMessages && (
        <div className="bg-red-500 text-white px-4 py-2 text-center">
          New messages below
        </div>
      )}
      <div className="message-list overflow-y-auto p-4 space-y-4 space-x-4 ">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">User {i + 1}</span>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  This is a sample message {i + 1}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <textarea
          rows={1}            
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary text-sm rounded-none px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${message.trim()
              ? "bg-primary hover:bg-hover-blue"
              : "bg-disabled-gray"
              }`}
          >
            <Send className="h-5 w-5 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary">
            <Mic className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div> */}
      <Separator className="bg-gray-700" />
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-700 rounded-none p-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none h-[40px] text-[14px]"
              />
              <div className="flex items-center space-x-2 text-gray-400">
                <button className="hover:text-white transition-colors duration-500">
                  <Image className="w-5 h-5" />
                </button>
                <button className="hover:text-white transition-colors duration-500">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="hover:text-white transition-colors duration-500">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <button
            className={`p-2 rounded-lg transition-colors duration-500 ${message.trim()
              ? 'bg-[#7289DA] text-white hover:bg-[#677bc4]'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>



    </div>

  );
};

export default Index;