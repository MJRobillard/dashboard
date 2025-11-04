import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

export interface WorkoutProgress {
  arms: number;
  legs: number;
  back: number;
  core: number;
  chest: number;
  flexibility: number;
}

export interface WorkoutData {
  date: string;
  completed: boolean;
  type: string;
  weight?: number;
}

interface WorkoutProgressCardProps {
  chartData: any;
  chartOptions: any;
}

export const WorkoutProgressCard: React.FC<WorkoutProgressCardProps> = ({ chartData, chartOptions }) => (
  <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-yellow-300 text-xl font-bold">Workout Progress</h3>
    </div>
    <div className="h-[300px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  </div>
);

interface WorkoutTypeCardProps {
  doughnutData: any;
  doughnutOptions: any;
}

export const WorkoutTypeCard: React.FC<WorkoutTypeCardProps> = ({ doughnutData, doughnutOptions }) => (
  <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-yellow-300 text-xl font-bold">Workout Type Distribution</h3>
    </div>
    <div className="h-[300px]">
      <Doughnut data={doughnutData} options={doughnutOptions} />
    </div>
  </div>
);

interface ProgressGoalsCardProps {
  workoutProgress: WorkoutProgress;
  workoutData: WorkoutData[];
  onAdjustGoals: () => void;
  user: any;
  router: any;
}

export const ProgressGoalsCard: React.FC<ProgressGoalsCardProps> = ({ workoutProgress, workoutData, onAdjustGoals, user, router }) => {
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 text-center py-8">
          <h3 className="text-yellow-300 text-xl font-bold mb-4">Progress Goals</h3>
          <p className="text-white/75 mb-6">Sign in to track your workout progress and set personal goals</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Progress Goals</h3>
        <button onClick={onAdjustGoals} className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400">Adjust Goals</button>
      </div>
      <div className="flex flex-col gap-3">
        {Object.entries(workoutProgress).map(([type, progress]) => {
          const color = '#FDB515';
          const workoutCount = workoutData.filter(w => w.completed && w.type === type).length;
          return (
            <div key={type} className="flex items-center gap-3">
              <div className="w-24 capitalize text-white" style={{ color }}>{type}</div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/75">{workoutCount} workouts completed</span>
                  <span className="font-medium text-white">{progress as number}%</span>
                </div>
                <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${Math.max(0, progress as number)}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 