import { Scissors } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center h-10 w-10 border-2 border-foreground rounded-full">
      <Scissors className="h-5 w-5 text-foreground" />
    </div>
  );
}
