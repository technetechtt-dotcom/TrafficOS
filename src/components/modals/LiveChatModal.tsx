import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SendIcon, UserIcon, BotIcon } from 'lucide-react';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}
interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages([
        {
          id: 'msg_1',
          text: 'Hi! How can I help you today?',
          sender: 'agent',
          timestamp: new Date()
        }]
        );
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    // Mock agent response
    setTimeout(() => {
      const responses = [
      'I can certainly help with that. Could you provide your ID number for verification?',
      "That's a great question. Let me check your account details.",
      'To dispute a fine, you can use the AI Analysis tool on the Fines page.',
      "I've noted that down. Is there anything else you need assistance with?"];

      const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
      const agentMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 2000);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Support Chat">
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) =>
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              
                <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                
                  {msg.sender === 'user' ?
                <UserIcon className="w-4 h-4" /> :

                <BotIcon className="w-4 h-4" />
                }
                </div>
                <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-tl-none'}`}>
                
                  {msg.text}
                  <div
                  className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  
                    {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </div>
                </div>
              </motion.div>
            )}
            {isTyping &&
            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.9
              }}
              className="flex gap-3">
              
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <BotIcon className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0ms'
                  }} />
                
                  <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '150ms'
                  }} />
                
                  <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '300ms'
                  }} />
                
                </div>
              </motion.div>
            }
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1" />
          
          <Button
            type="submit"
            variant="primary"
            className="px-4"
            disabled={!inputText.trim()}>
            
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Modal>);

}