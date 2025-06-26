import React from 'react';
import { Line } from 'react-chartjs-2';

interface WeightProgressCardProps {
  weightChartData: any;
  weightChartOptions: any;
  onShowWeightModal: () => void;
}

const WeightProgressCard: React.FC<WeightProgressCardProps> = ({ weightChartData, weightChartOptions, onShowWeightModal }) => (
  <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-yellow-300 text-xl font-bold">Weight Progress</h3>
      <button onClick={onShowWeightModal} className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400">Update Weight</button>
    </div>
    <div className="h-[300px]">
      <Line data={weightChartData} options={weightChartOptions} />
    </div>
  </div>
);

export default WeightProgressCard; 