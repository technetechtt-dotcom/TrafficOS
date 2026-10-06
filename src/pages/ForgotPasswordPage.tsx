import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldIcon,
  MailIcon,
  ArrowLeftIcon,
  KeyRoundIcon,
  LockIcon,
  CheckCircleIcon } from
'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';

type Step = 'email' | 'code' | 'password' | 'done';

export function ForgotPasswordPage() {
  const { dispatch } = useAppStore();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordError = useMemo(() => {
    if (confirm.length === 0) return undefined;
    if (password !== confirm) return 'Passwords do not match';
    return undefined;
  }, [password, confirm]);

  const advance = (next: Step, message: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(next);
      toast.success(message);
    }, 1200);
  };

  const goToLogin = () =>
  dispatch({
    type: 'SET_TAB',
    payload: 'login'
  });

  const stepMeta: Record<
    Step,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
    }> =
  {
    email: {
      icon: <MailIcon className="w-6 h-6" />,
      title: 'Reset your password',
      description:
      'Enter the email on your TrafficOS account and we will send a six-digit verification code.'
    },
    code: {
      icon: <KeyRoundIcon className="w-6 h-6" />,
      title: 'Enter your code',
      description: `We sent a six-digit code to ${email}. It expires in 10 minutes.`
    },
    password: {
      icon: <LockIcon className="w-6 h-6" />,
      title: 'Choose a new password',
      description:
      'Pick something you have not used before. At least 8 characters with mixed case and a number.'
    },
    done: {
      icon: <CheckCircleIcon className="w-6 h-6" />,
      title: 'Password updated',
      description:
      'Your password has been changed. Sign in with your new credentials.'
    }
  };

  const meta = stepMeta[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 16
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.25,
          ease: [0.23, 1, 0.32, 1]
        }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg ${step === 'done' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}>
            
            {step === 'email' ? <ShieldIcon className="w-6 h-6" /> : meta.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {meta.description}
          </p>
        </div>

        {/* Progress */}
        {step !== 'done' &&
        <div className="flex gap-1.5 mb-6" aria-hidden="true">
            {(['email', 'code', 'password'] as Step[]).map((s, index) => {
            const order = ['email', 'code', 'password'];
            const isActive = order.indexOf(step) >= index;
            return (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />);


          })}
          </div>
        }

        {step === 'email' &&
        <form
          onSubmit={(e) => {
            e.preventDefault();
            advance('code', 'Verification code sent');
          }}
          className="space-y-5">
          
            <Input
            label="Email Address"
            type="email"
            placeholder="name@example.co.za"
            leftIcon={<MailIcon className="w-5 h-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
          
            <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}>
            
              Send code
            </Button>
          </form>
        }

        {step === 'code' &&
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length !== 6) {
              toast.error('Enter the six-digit code');
              return;
            }
            advance('password', 'Code verified');
          }}
          className="space-y-5">
          
            <Input
            label="Verification Code"
            placeholder="000000"
            maxLength={6}
            leftIcon={<KeyRoundIcon className="w-5 h-5" />}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            helperText="For this demo, any six digits will do."
            required />
          
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Verify code
            </Button>
            <button
            type="button"
            onClick={() => toast.success('A new code is on its way')}
            className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            
              Resend code
            </button>
          </form>
        }

        {step === 'password' &&
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 8) {
              toast.error('Use at least 8 characters');
              return;
            }
            if (password !== confirm) {
              toast.error('Passwords do not match');
              return;
            }
            advance('done', 'Password changed');
          }}
          className="space-y-5">
          
            <Input
            label="New Password"
            type="password"
            placeholder="Create a strong password"
            leftIcon={<LockIcon className="w-5 h-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
          
            <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            leftIcon={<LockIcon className="w-5 h-5" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={passwordError}
            required />
          
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Update password
            </Button>
          </form>
        }

        {step === 'done' &&
        <Button fullWidth size="lg" onClick={goToLogin}>
            Back to sign in
          </Button>
        }

        {step !== 'done' &&
        <div className="mt-6 text-center">
            <button
            onClick={goToLogin}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            
              <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
              Back to sign in
            </button>
          </div>
        }
      </motion.div>
    </div>);

}