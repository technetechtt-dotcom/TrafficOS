import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, MailIcon, LockIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../stores/useAppStore';
import { mockUser } from '../data/mockData';
export function LoginPage() {
  const { dispatch } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      dispatch({
        type: 'LOGIN',
        payload: mockUser
      });
      setIsLoading(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/20">
            <ShieldIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            TrafficOS <span className="text-blue-600">SA</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            Manage and dispute your South African traffic fines intelligently.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.co.za"
            defaultValue="thabo.m@example.co.za"
            leftIcon={<MailIcon className="w-5 h-5" />}
            required />
          

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              defaultValue="password123"
              leftIcon={<LockIcon className="w-5 h-5" />}
              required />
            
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() =>
                dispatch({
                  type: 'SET_TAB',
                  payload: 'forgot-password'
                })
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="mt-6">
            
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() =>
              dispatch({
                type: 'SET_TAB',
                payload: 'register'
              })
              }
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              
              Register here
            </button>
          </p>
        </div>
      </motion.div>
    </div>);

}