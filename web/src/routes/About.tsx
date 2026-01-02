import { AppLayout, Card } from '../components';
import { createdByPic, worldcupLogo } from '../assets';

export const About = () => {
  return (
    <AppLayout>
      <div className="md:min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <Card className="p-6">
            {/* Project Description */}
            <div className="mb-6">
              <div className="flex flex-row items-center justify-center gap-4 mb-8 mt-4">
                <img src={worldcupLogo} alt="World Cup 2026" className="h-16" />
                <h2 className="text-2xl font-semibold text-white">
                  FIFA WORLD CUP 2026 POOL
                </h2>
              </div>
              <p className="text-white/80">
                A fun and competitive FIFA World Cup 2026 prediction game. Guess
                match scores, challenge friends and family, and race up the
                leaderboard for ultimate bragging rights!
              </p>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Created by */}
            <div className="mb-6 flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={createdByPic}
                  alt="Jonathan Hernández"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <h2 className="text-xl font-semibold">
                  Created by Jonathan Hernández
                </h2>
              </div>
              <div className="flex gap-2 text-sm">
                <a
                  href="https://github.com/ionmx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <span className="text-white/20">•</span>
                <a
                  href="https://www.linkedin.com/in/ionmx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Contribute */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>🤝</span> Contribute
              </h2>
              <p className="text-white/80 mb-4">
                This project is open source! Contributions, bug reports, and
                feature requests are welcome. Built with React, Firebase, and
                Tailwind CSS — no VAR needed here 😉
              </p>
              <a
                href="https://github.com/ionmx/worldcup-2026-pool"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⭐ Star on GitHub
              </a>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Support */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>☕</span> Support
              </h2>
              <p className="text-white/80 mb-4">
                If you enjoy this project, consider buying me a coffee to
                support future development!
              </p>
              <a
                href="https://www.buymeacoffee.com/ionmx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=ionmx&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff"
                  alt="Buy me a coffee"
                  className="h-10"
                />
              </a>
            </div>
          </Card>

          <p className="text-white/50 text-sm text-center mt-8">
            Made with 🫶 for the fans
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
