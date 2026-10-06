import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  HashIcon,
  CheckIcon } from
'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';

interface FormState {
  name: string;
  email: string;
  idNumber: string;
  phone: string;
  password: string;
}

function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  tone: string;
  bar: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
  {
    label: 'Too weak',
    tone: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500 w-1/4'
  },
  {
    label: 'Weak',
    tone: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500 w-1/3'
  },
  {
    label: 'Good',
    tone: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500 w-2/3'
  },
  {
    label: 'Strong',
    tone: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500 w-full'
  }];


  return {
    score: score as 0 | 1 | 2 | 3,
    ...levels[score]
  };
}

/** Validates an SA ID number's length and the Luhn check digit. */
function isValidSaId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  const digits = id.split('').map(Number);
  const check = digits.pop() as number;
  let sum = 0;
  digits.reverse().forEach((digit, index) => {
    if (index % 2 === 0) {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
  });
  return (10 - sum % 10) % 10 === check;
}

export function RegisterPage() {
  const { dispatch } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    idNumber: '',
    phone: '',
    password: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const strength = useMemo(
    () => passwordStrength(form.password),
    [form.password]
  );

  const idError =
  touched.idNumber && form.idNumber.length > 0 && !isValidSaId(form.idNumber) ?
  'That does not look like a valid SA ID number' :
  undefined;

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((prev) => ({
    ...prev,
    [key]: e.target.value
  }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidSaId(form.idNumber)) {
      setTouched((t) => ({
        ...t,
        idNumber: true
      }));
      toast.error('Enter a valid 13-digit South African ID number');
      return;
    }
    if (strength.score < 2) {
      toast.error('Choose a stronger password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      dispatch({
        type: 'LOGIN',
        payload: {
          id: `usr_${Date.now()}`,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          idNumber: form.idNumber.trim()
        }
      });
      setIsLoading(false);
      toast.success(`Welcome to TrafficOS, ${form.name.split(' ')[0]}`);
    }, 1400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 py-12">
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
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/20">
            <ShieldIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            We use your ID number to pull your fines from AARTO.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Thabo Mokoena"
            leftIcon={<UserIcon className="w-5 h-5" />}
            value={form.name}
            onChange={set('name')}
            required />
          

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.co.za"
            leftIcon={<MailIcon className="w-5 h-5" />}
            value={form.email}
            onChange={set('email')}
            required />
          

          <Input
            label="South African ID Number"
            placeholder="13 digit ID number"
            maxLength={13}
            leftIcon={<HashIcon className="w-5 h-5" />}
            helperText="Required for AARTO fine verification"
            value={form.idNumber}
            onChange={set('idNumber')}
            onBlur={() =>
            setTouched((t) => ({
              ...t,
              idNumber: true
            }))
            }
            error={idError}
            required />
          

          <Input
            label="Phone Number"
            type="tel"
            placeholder="082 123 4567"
            leftIcon={<PhoneIcon className="w-5 h-5" />}
            value={form.phone}
            onChange={set('phone')}
            required />
          

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              leftIcon={<LockIcon className="w-5 h-5" />}
              value={form.password}
              onChange={set('password')}
              required />
            
            {form.password.length > 0 &&
            <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                  className={`h-full rounded-full transition-all duration-200 ${strength.bar}`} />
                
                </div>
                <p className={`text-xs mt-1.5 font-medium ${strength.tone}`}>
                  {strength.label} — use 8+ characters with mixed case, a number
                  and a symbol.
                </p>
              </div>
            }
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="mt-6">
            
            Create Account
          </Button>
        </form>

        <div className="mt-5 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p>
            By creating an account you agree to our{' '}
            <button
              onClick={() =>
              dispatch({
                type: 'SET_TAB',
                payload: 'privacy'
              })
              }
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              
              Privacy Policy
            </button>{' '}
            and to POPIA-compliant processing of your personal information. You
            can withdraw consent at any time.
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() =>
              dispatch({
                type: 'SET_TAB',
                payload: 'login'
              })
              }
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>);

}