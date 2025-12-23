import { Scissors } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Scissors className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold italic">
        NOVA'S BRAID GAME
      </span>
    </div>
  );
}
