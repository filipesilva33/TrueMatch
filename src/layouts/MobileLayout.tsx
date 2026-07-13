import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Flame, Heart, MessageCircle, User, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('matchdeck_user_token');
    if (!token) {
      navigate('/welcome');
    }
  }, [navigate]);

  const navItems = [
    { icon: Flame, path: '/', label: 'Encontros' },
    { icon: MapPin, path: '/reels', label: 'Descobrir' },
    { icon: Heart, path: '/matches', label: 'Curtidas' },
    { icon: MessageCircle, path: '/chat', label: 'Chat' },
    { icon: User, path: '/profile', label: 'Perfil' },
  ];

  return (
    <div className={cn(
      "min-h-screen flex justify-center items-center p-0 md:p-4 lg:p-8 transition-colors duration-300",
      "bg-black"
    )}>
      {/* Mobile Frame Container */}
      <div className={cn(
        "w-full h-[100dvh] md:h-[844px] md:w-[390px] md:max-h-[90vh] md:rounded-[3rem] md:border-[8px] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300",
        "bg-zinc-950 border-zinc-900 text-white"
      )}>

        {/* Main Content Area */}
        <div className="absolute inset-0 overflow-hidden flex flex-col">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className={cn(
          "absolute bottom-0 inset-x-0 z-40 backdrop-blur-2xl border-t flex flex-col pt-3 pb-2 md:pb-4 px-4 pointer-events-auto transition-colors duration-300",
          "bg-zinc-950/85 border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.8)]"
        )}>
          {/* Sleek neon glowing top-border line to enhance premium look */}
          <div className={cn(
            "absolute top-0 inset-x-0 h-[1.5px] transition-all duration-300",
            "bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"
          )}></div>
          
          <div className="flex justify-around items-center w-full max-w-[360px] mx-auto relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center w-[64px] h-[52px] rounded-2xl group outline-none select-none"
                >
                  {/* Entire button micro-tap feedback wrapper */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center w-full h-full rounded-2xl"
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                  >
                    {/* Ambient spotlight glow behind the active item */}
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "absolute w-12 h-12 rounded-full blur-[12px] -z-10",
                          "bg-gradient-to-tr from-pink-500/15 to-purple-500/15"
                        )}
                        transition={{ duration: 0.1 }}
                      />
                    )}

                    {/* Sliding sleek bottom neon pill indicator */}
                    {isActive && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-1 w-6 h-[3px] bg-gradient-to-r from-pink-500 via-rose-400 to-purple-600 rounded-full shadow-[0_1px_10px_rgba(236,72,153,0.8),0_0_15px_rgba(168,85,247,0.5)]"
                        transition={{ duration: 0.1 }}
                      />
                    )}

                    {/* Smoothly animated icon container with spring lift effect */}
                    <motion.div
                      animate={{
                        y: isActive ? -4 : 0,
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="relative flex items-center justify-center mb-1 z-10"
                    >
                      <item.icon
                        className={cn(
                          "w-[20px] h-[20px] transition-colors duration-100",
                          isActive 
                            ? "text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" 
                            : "text-zinc-500 group-hover:text-zinc-300"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>
                    
                    {/* Micro-animated tracking-widest text labels */}
                    <motion.span 
                      animate={{
                        scale: isActive ? 1 : 0.95,
                        opacity: isActive ? 1 : 0.6,
                        y: isActive ? -1 : 0
                      }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className={cn(
                        "text-[9px] font-extrabold uppercase tracking-widest transition-colors duration-100 z-10 select-none",
                        isActive 
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-zinc-400"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                </NavLink>
              );
            })}
          </div>

          {/* Simulated premium iOS Home Indicator */}
          <div className={cn(
            "w-32 h-1 rounded-full mx-auto mt-2 hidden md:block transition-colors duration-300",
            "bg-white/10"
          )}></div>
        </div>
      </div>
    </div>
  );
}
