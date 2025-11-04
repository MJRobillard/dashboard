import AchievementsCard from './AchievementsCard';
import { WorkoutProgressCard, WorkoutTypeCard, ProgressGoalsCard } from './WorkoutProgressCards';
import FriendsCard from './FriendsCard';
import CrowdMeterCard from './CrowdMeterCard';
import RsfScheduleCard from './RsfScheduleCard';
import WeightProgressCard from './WeightProgressCard';
import PersonalTimelineCard from './PersonalTimelineCard';

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
  // Add more as you modularize them
}; 