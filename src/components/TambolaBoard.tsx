import { cn } from '../utils';

interface TambolaBoardProps {
  allNumbers: number[];
  calledNumbers: number[];
  currentNumber: number | null;
  theme: string;
}

export function TambolaBoard({ allNumbers, calledNumbers, currentNumber, theme }: TambolaBoardProps) {
  // Theme specific classes
  const boardBg = theme === 'neon' ? 'bg-black border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
               : theme === 'dark' ? 'bg-gray-800 border-gray-700' 
               : 'bg-white border-gray-200 shadow-sm';
               
  const defaultCell = theme === 'neon' ? 'bg-gray-900 border-gray-800 text-gray-500' 
                   : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-400' 
                   : 'bg-gray-50 border-gray-200 text-gray-400';

  const calledCell = theme === 'neon' ? 'bg-purple-900 border-purple-500 text-purple-100 shadow-[inset_0_0_10px_rgba(168,85,247,0.5)]' 
                  : theme === 'dark' ? 'bg-teal-900 border-teal-600 text-teal-100' 
                  : 'bg-teal-100 border-teal-300 text-teal-800';

  const currentCell = theme === 'neon' ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(217,70,239,0.8)] scale-110 z-10' 
                   : theme === 'dark' ? 'bg-teal-500 border-teal-300 text-white scale-110 z-10 shadow-lg' 
                   : 'bg-teal-500 border-teal-400 text-white scale-110 z-10 shadow-lg';

  return (
    <div className={cn('grid grid-cols-10 gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border', boardBg)}>
      {allNumbers.map((num) => {
        const isCalled = calledNumbers.includes(num);
        const isCurrent = currentNumber === num;
        
        return (
          <div
            key={num}
            className={cn(
              'flex items-center justify-center aspect-square rounded-md sm:rounded-lg text-sm sm:text-base md:text-xl font-semibold transition-all duration-300 border-[1px] sm:border-2',
              !isCalled && !isCurrent && defaultCell,
              isCalled && !isCurrent && calledCell,
              isCurrent && currentCell
            )}
          >
            {num}
          </div>
        );
      })}
    </div>
  );
}
