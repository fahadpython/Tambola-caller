import { cn } from '../utils';

interface CurrentNumberProps {
  number: number | null;
  theme: string;
}

export function CurrentNumber({ number, theme }: CurrentNumberProps) {
  const containerClass = theme === 'neon' ? 'bg-black border-2 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.5)]'
                       : theme === 'dark' ? 'bg-gray-800 border border-gray-700 shadow-xl'
                       : 'bg-white border border-gray-200 shadow-xl';

  const textClass = theme === 'neon' ? 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]'
                  : theme === 'dark' ? 'text-white'
                  : 'text-gray-900';

  const labelClass = theme === 'neon' ? 'text-purple-400'
                   : theme === 'dark' ? 'text-gray-400'
                   : 'text-gray-500';

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 md:p-10 rounded-3xl w-full max-w-sm mx-auto', containerClass)}>
      <h2 className={cn('text-sm md:text-base font-medium tracking-widest uppercase mb-2', labelClass)}>
        Current Number
      </h2>
      <div 
        key={number} // Key helps re-trigger animations if we add them
        className={cn('text-8xl md:text-[10rem] font-bold leading-none animate-in fade-in zoom-in duration-300', textClass)}
      >
        {number ?? '-'}
      </div>
    </div>
  );
}
