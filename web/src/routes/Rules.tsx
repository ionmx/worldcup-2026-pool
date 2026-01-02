import { AppLayout, Card } from '../components';

export const Rules = () => {
  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Scoring Rules</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            How Points Are Calculated
          </h2>

          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥳</span>
              <div>
                <h3 className="font-semibold text-white">
                  Exact Score — 15 points
                </h3>
                <p className="text-sm">
                  Predict the exact final score of both teams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😄</span>
              <div>
                <h3 className="font-semibold text-white">
                  Correct Result — Up to 10 points
                </h3>
                <p className="text-sm">
                  Predict the correct winner (or draw), but not the exact score.
                  Points = 10 minus the difference from the actual scores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😔</span>
              <div>
                <h3 className="font-semibold text-white">
                  Wrong Result — 0 points
                </h3>
                <p className="text-sm">
                  Predict the wrong winner or miss a draw.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Examples</h2>

          <div className="space-y-6">
            {/* Example 1: Exact score */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <span className="text-green-400 font-bold">
                  🥳 15 points (Exact!)
                </span>
              </div>
            </div>

            {/* Example 2: Correct winner */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Brazil 2 - 1 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Brazil 3 - 0 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 8 points</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |3-2| - |0-1| = 8
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3: Correct draw */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Netherlands 2 - 2 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Netherlands 0 - 0 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 6 points</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |0-2| - |0-2| = 6
                  </div>
                </div>
              </div>
            </div>

            {/* Example 4: Wrong result */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  England 2 - 1 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  England 0 - 2 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <span className="text-red-400 font-bold">
                  😔 0 points (Wrong winner)
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
