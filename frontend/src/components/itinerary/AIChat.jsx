import React, { useState } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, User, ChevronUp } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

const AIChat = () => {
  const { chatWithAssistant, currentTrip } = useTrip();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your TripPilot Co-Pilot. Ask me to make this trip cheaper, swap activities, avoid crowds, or adjust the pacing!`
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Show restaurants near my hotel',
    'Find attractions within 5 km',
    'Show Day 2 itinerary',
    'Make this trip cheaper',
    'Add more adventure activities'
  ];

  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim() || loading) return;

    const userMessage = { sender: 'user', text: msg };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatWithAssistant(msg);
      if (res && res.reply) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I had trouble processing that request right now. Try again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Trigger floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ask-trippilot-btn"
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Ask TripPilot</span>
        </button>
      )}

      {/* Floating Chat Drawer (Section 15) */}
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#090611] border border-slate-200 dark:border-violet-500/30 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-[#170A2B] to-[#350A1E] text-white flex items-center justify-between border-b border-violet-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-amber-400 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-display text-sm">TripPilot Assistant</h4>
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Live Conversational Co-Pilot
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[80%] whitespace-pre-line leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-slate-100 dark:bg-[#12091F] text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-200/60 dark:border-white/[0.08]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-400">
                <Bot className="w-4 h-4 text-violet-400 animate-spin" />
                <span>TripPilot is rethinking your trip...</span>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="p-2 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50 dark:bg-[#050505]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-[#12091F] text-[11px] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.08] hover:border-violet-500 hover:text-violet-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center gap-2 bg-white dark:bg-[#090611]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this trip..."
              className="flex-1 bg-slate-100 dark:bg-[#12091F] text-xs px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 border border-transparent dark:border-white/[0.06]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 text-white hover:brightness-110 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
