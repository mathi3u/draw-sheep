'use client'

interface InfoModalProps {
  onClose: () => void
  onAmnesty: () => void
  sheepCount: number
  removedCount: number
}

export default function InfoModal({ onClose, onAmnesty, sheepCount, removedCount }: InfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1f3e] rounded-2xl p-6 w-[360px] max-w-[95vw] text-white relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-4">Dessine-moi un mouton</h2>

        <div className="space-y-3 text-sm text-white/70">
          <p>
            &laquo; S&apos;il vous plait... dessine-moi un mouton ! &raquo;
          </p>

          <p className="text-white/50 text-xs italic">
            &mdash; Le Petit Prince, Antoine de Saint-Exupery
          </p>

          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <p><strong className="text-white/90">Cliquer</strong> sur un mouton pour le faire sauter</p>
            <p><strong className="text-white/90">Double-cliquer</strong> pour le retirer</p>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <p className="text-xs text-white/40">
              {sheepCount} mouton{sheepCount !== 1 ? 's' : ''} actif{sheepCount !== 1 ? 's' : ''}
              {removedCount > 0 && ` / ${removedCount} retire${removedCount !== 1 ? 's' : ''}`}
            </p>
            <p className="text-xs text-white/30">
              Made by mathi3u. Inspired by{' '}
              <a href="https://gradient.horse" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">gradient.horse</a>
            </p>
          </div>
        </div>

        {removedCount > 0 && (
          <button
            onClick={() => {
              onAmnesty()
              onClose()
            }}
            className="w-full mt-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
          >
            Amnistie des moutons ({removedCount})
          </button>
        )}
      </div>
    </div>
  )
}
