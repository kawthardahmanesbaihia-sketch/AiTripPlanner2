'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Users2, User, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function ChooseModePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const modes = [
    {
      id: 'single',
      label: 'Single',
      description: 'Plan your trip solo with AI guidance',
      icon: User,
      href: '/single',
      color: 'from-blue-500 to-cyan-500',
      players: '1 Player',
    },
    {
      id: 'duo',
      label: 'Duo',
      description: 'Plan with one friend in real-time',
      icon: Users,
      href: '/multiplayer',
      color: 'from-purple-500 to-pink-500',
      players: '2 Players',
    },
    {
      id: 'squad',
      label: 'Squad',
      description: 'Plan with your entire friend group',
      icon: Users2,
      href: '/multiplayer',
      color: 'from-orange-500 to-red-500',
      players: '3+ Players',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackgroundElements />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="container relative z-10 mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
            <p className="text-muted-foreground text-lg">Choose how you want to plan your trip</p>
          </motion.div>

          {/* Mode Selection Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={mode.href}>
                    <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer h-full overflow-hidden group shadow-lg hover:shadow-2xl hover:shadow-primary/30">
                      <div className={`bg-gradient-to-br ${mode.color} h-32 relative overflow-hidden`}>
                        <motion.div
                          className="absolute inset-0 bg-white/10"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{mode.label}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                            {mode.players}
                          </div>
                        </div>

                        <Button className="w-full" size="lg">
                          Choose {mode.label}
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
