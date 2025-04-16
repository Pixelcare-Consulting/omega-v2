'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useAction } from 'next-safe-action/hooks'

import Alert from '@/components/alert'
import { Form } from '@/components/ui/form'
import InputField from '@/components/form/input-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginForm, loginFormSchema } from '@/schema/auth'
import { loginUser } from '@/actions/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingButton from '@/components/loading-button'
import { Icons } from '@/components/icons'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

// Auth Status Modal Component
const AuthStatusModal = ({ 
  isOpen, 
  status, 
  message, 
  onClose 
}: { 
  isOpen: boolean; 
  status: 'loading' | 'success' | 'error'; 
  message: string;
  onClose: () => void;
}) => {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === 'success' && isOpen) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(5);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95">
        <DialogHeader className="pb-2">
          <DialogTitle className={`text-center text-xl ${status === 'success' ? 'text-primary' : ''}`}>
            {status === 'loading' ? 'Authenticating...' : 
              status === 'success' ? 'Welcome Back!' : 'Authentication Error'}
          </DialogTitle>
          <DialogDescription className="text-center pt-1">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-6">
              {/* Elegant spinner with Omega branding */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-2 border-gray-100 dark:border-gray-800"></div>
                  <div className="absolute h-20 w-20 rounded-full border-t-2 border-primary animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icons.dashboard className="size-8 text-primary animate-pulse" />
                </div>
              </div>
              
              {/* Progress indication */}
              <div className="w-full max-w-[200px] h-1 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div className="h-full bg-primary animate-pulse-slow"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center gap-6">
              {/* Success animation */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-green-100 dark:border-green-900/30"></div>
                <div className="absolute h-full w-full animate-ping rounded-full bg-green-100 opacity-20 dark:bg-green-700/20"></div>
                <div className="animate-in zoom-in-50 rounded-full bg-green-50 p-4 dark:bg-green-900/30">
                  <Icons.checkCircle className="size-10 text-green-500" />
                </div>
              </div>
              
              {/* Success message */}
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Login successful! Your dashboard is ready.</p>
                <p className="text-xs text-muted-foreground">
                  Redirecting in {countdown} seconds...
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 w-full">
                <Button 
                  className="flex-1"
                  onClick={onClose}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center gap-6">
              {/* Error animation */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900/30"></div>
                <div className="animate-in zoom-in-50 rounded-full bg-red-50 p-4 dark:bg-red-900/30">
                  <Icons.circleAlert className="size-10 text-red-500" />
                </div>
              </div>
              
              {/* Action buttons */}
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={onClose}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SigninForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    status: 'loading' | 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    status: 'loading',
    message: '',
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const form = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: { email: '', password: '', callbackUrl },
    resolver: zodResolver(loginFormSchema)
  });

  const { executeAsync, isExecuting } = useAction(loginUser);

  const handleSubmit = async (formValues: LoginForm) => {
    setError('');
    setSuccess('');
    
    // Show loading modal
    setModalState({
      isOpen: true,
      status: 'loading',
      message: 'Verifying your credentials...'
    });

    try {
      const response = await executeAsync(formValues);
      const result = response?.data;

      if (result && !result.error) {
        // Show success modal
        setModalState({
          isOpen: true,
          status: 'success',
          message: `Welcome back, ${formValues.email.split('@')[0]}!`
        });
        
        setSuccess('Successfully logged in!');
        form.reset();
        
        // Redirect will happen after countdown or when user clicks the button
        return;
      }

      if (result && result.error) {
        setError(result.message);
        // Show error modal
        setModalState({
          isOpen: true,
          status: 'error',
          message: result.message || 'Authentication failed. Please verify your credentials and try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong! Please try again later.');
      // Show error modal
      setModalState({
        isOpen: true,
        status: 'error',
        message: 'Connection error. Please check your internet connection and try again.'
      });
    }
  };
  
  const handleModalClose = () => {
    if (modalState.status === 'success') {
      // Redirect to dashboard or callback URL
      router.push(callbackUrl);
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col items-center gap-3 text-center'>
        <h1 className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl'>
          Welcome Back
        </h1>
        <p className='text-balance text-sm text-muted-foreground'>
          Enter your credentials to access your account
        </p>
      </div>

      <Alert 
        variant='success' 
        message={success} 
        className='animate-in fade-in-50 slide-in-from-top-5' 
      />
      <Alert 
        variant='error' 
        message={error} 
        className='animate-in fade-in-50 slide-in-from-top-5' 
      />

      <Form {...form}>
        <form 
          id='login-form' 
          className='flex flex-col gap-6' 
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className='space-y-4'>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{ 
                inputProps: { 
                  placeholder: 'm@example.com',
                  className: 'h-11'
                }
              }}
            />

            <div className='space-y-1'>
              <InputField
                control={form.control}
                name='password'
                label='Password'
                extendedProps={{ 
                  inputProps: { 
                    placeholder: '••••••••',
                    type: 'password',
                    className: 'h-11'
                  }
                }}
              />

              <div className='flex items-center justify-end'>
                <Button 
                  asChild 
                  className='h-auto px-0 font-normal hover:text-primary' 
                  variant='link'
                >
                  <Link href='/forgot-password' className='text-xs'>
                    Forgot Password?
                  </Link>
                </Button>
              </div>
            </div>

            <LoadingButton 
              type='submit' 
              className='h-11 w-full gap-2 text-base font-medium' 
              isLoading={isExecuting} 
              loadingText='Signing in...'
            >
              {!isExecuting && <Icons.login className='size-4' />}
              Sign in
            </LoadingButton>
          </div>
        </form>
      </Form>

      <div className='text-center'>
        <span className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Button 
            asChild 
            variant='link' 
            className='h-auto p-0 text-sm font-normal hover:text-primary'
          >
            <Link href='/register'>
              Create an account
            </Link>
          </Button>
        </span>
      </div>
      
      {/* Auth Status Modal */}
      <AuthStatusModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default SigninForm;

