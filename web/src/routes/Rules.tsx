import { AppLayout, Card } from '../components';

const scoringRules = [
  {
    icon: '🥳',
    title: 'Exact Score — 6 points',
    description: 'Predict the exact final score of both teams.',
  },
  {
    icon: '😄',
    title: 'Close Result — 3 points',
    description:
      'Predict the correct winner or draw, with each team score within 1 goal of the actual score.',
  },
  {
    icon: '👍',
    title: 'Correct Winner or Draw — 2 points',
    description: 'Predict the correct winner, or correctly predict a draw.',
  },
  {
    icon: '😔',
    title: 'Wrong Result — 0 points',
    description: 'Predict the wrong winner or miss a draw.',
  },
];

const examples = [
  {
    actual: 'Mexico 2 - 1 South Africa',
    prediction: 'Mexico 2 - 1 South Africa',
    points: '🥳 6 points',
    detail: 'Exact score',
    color: 'text-green-400',
  },
  {
    actual: 'Brazil 1 - 0 Morocco',
    prediction: 'Brazil 2 - 1 Morocco',
    points: '😄 3 points',
    detail: 'Correct winner, both team scores within 1',
    color: 'text-yellow-400',
  },
  {
    actual: 'Netherlands 2 - 0 Japan',
    prediction: 'Netherlands 4 - 1 Japan',
    points: '👍 2 points',
    detail: 'Correct winner',
    color: 'text-blue-400',
  },
  {
    actual: 'England 2 - 1 Croatia',
    prediction: 'England 0 - 2 Croatia',
    points: '😔 0 points',
    detail: 'Wrong winner',
    color: 'text-red-400',
  },
];

export const Rules = () => {
  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Rules</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Prediction Deadline
          </h2>
          <div className="flex items-start gap-3 text-white/80">
            <span className="text-2xl">⏰</span>
            <p>
              Predictions must be submitted{' '}
              <span className="text-white font-semibold">
                at least 10 minutes before kickoff
              </span>
              . After that, predictions are locked and cannot be changed.
            </p>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            How Points Are Calculated
          </h2>

          <div className="space-y-4 text-white/80">
            {scoringRules.map((rule) => (
              <div key={rule.title} className="flex items-start gap-3">
                <span className="text-2xl">{rule.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{rule.title}</h3>
                  <p className="text-sm">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-green-400/30 bg-green-500/10 p-4">
            <h3 className="font-semibold text-white mb-2">
              Knockout Penalty Bonus — +1 point
            </h3>
            <p className="text-sm text-white/80">
              In knockout matches, if you predict a draw, you can also pick who
              advances on penalties. If that penalty winner is correct, you earn
              1 extra point.
            </p>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-white mb-4">
            Examples
          </h2>

          <div className="space-y-6">
            {examples.map((example, index) => (
              <div
                key={`${example.actual}-${example.prediction}`}
                className={index < examples.length - 1 ? 'border-b border-white/10 pb-4' : ''}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <span className="text-white/60 text-sm">Actual Result</span>
                  <span className="text-white font-mono">{example.actual}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <span className="text-white/60 text-sm">Your Prediction</span>
                  <span className="text-white font-mono">{example.prediction}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="text-white/60 text-sm">Points Earned</span>
                  <div className="md:text-right">
                    <span className={`${example.color} font-bold`}>{example.points}</span>
                    <div className="text-white/40 text-xs">{example.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
