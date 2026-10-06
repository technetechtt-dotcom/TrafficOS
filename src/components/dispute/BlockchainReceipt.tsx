import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
interface BlockchainReceiptProps {
  hash: string;
  timestamp: string;
}
export function BlockchainReceipt({ hash, timestamp }: BlockchainReceiptProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Hash copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg border border-gray-700">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-emerald-400 font-medium text-sm">
          <ShieldIcon className="w-4 h-4 mr-2" />
          Verified on Blockchain
        </div>
        <div className="text-xs text-gray-400">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-3 flex items-center justify-between mb-3 border border-gray-700/50">
        <code className="text-xs text-gray-300 font-mono truncate mr-3">
          {hash}
        </code>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white flex-shrink-0"
          title="Copy Hash">
          
          {copied ?
          <CheckIcon className="w-4 h-4 text-emerald-400" /> :

          <CopyIcon className="w-4 h-4" />
          }
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        This cryptographic proof verifies your dispute was submitted at the
        recorded time. It cannot be altered by the issuing authority.
      </p>
    </motion.div>);

}