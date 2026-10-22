import React from 'react';
import { DashboardView } from './DashboardView';

interface DashboardProps {
  onStartInterview: () => void;
  onViewReport: (session: any) => void;
  onViewAllHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartInterview,
  onViewReport,
}) => {
  return (
    <DashboardView
      onNavigate={() => onStartInterview()}
      onViewSessionReport={(session) => onViewReport(session)}
    />
  );
};
