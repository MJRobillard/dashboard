import AchievementsCard from './AchievementsCard';
import { WorkoutProgressCard, WorkoutTypeCard, ProgressGoalsCard } from './WorkoutProgressCards';
import FriendsCard from './FriendsCard';
import CrowdMeterCard from './CrowdMeterCard';
import RsfScheduleCard from './RsfScheduleCard';
import WeightProgressCard from './WeightProgressCard';
import PersonalTimelineCard from './PersonalTimelineCard';
import { RSFOccupancyAnalysis } from './RSFOccupancyAnalysis';

export const cardRegistry = {
  rsfSchedule: RsfScheduleCard,
  crowdMeter: CrowdMeterCard,
  achievements: AchievementsCard,
  workoutProgress: WorkoutProgressCard,
  workoutType: WorkoutTypeCard,
  progressGoals: ProgressGoalsCard,
  friends: FriendsCard,
  weightProgress: WeightProgressCard,
  personalTimeline: PersonalTimelineCard,
  rsfAnalysis: RSFOccupancyAnalysis,
  // Add more as you modularize them
}; 