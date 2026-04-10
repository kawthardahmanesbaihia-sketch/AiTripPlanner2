'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, user } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ✅ Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/choose-mode');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(loginUsername, loginPassword); // ✅ بدل email بـ username
      router.push('/choose-mode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await signup(signupUsername, signupEmail, signupPassword);
      router.push('/choose-mode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackgroundElements />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="container relative z-10 mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Trip Planner</h1>
                <p className="text-muted-foreground">Create your account or login</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* LOGIN */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">

                    {/* ✅ Username بدل Email */}
                    <motion.div>
                      <label className="blocklock text-sm font-semibold mb-2">Username</label>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div>
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isLoading || !loginUsername || !loginPassword}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>

                {/* SIGN UP */}
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">

                    {/* ✅ Username جديد */}
                    <motion.div>
                      <label className="block text-sm font-semibold mb-2">Username</label>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div>
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="Choose a password (min 6 chars)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div>
                      <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isLoading ||
                          !signupUsername ||
                          !signupEmail ||
                          !signupPassword ||
                          !signupConfirmPassword
                        }
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Sign Up'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-muted-foreground text-center">
                By signing up or logging in, you agree to our terms and conditions.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}