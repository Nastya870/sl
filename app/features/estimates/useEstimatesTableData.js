import { useProjectDashboard } from 'hooks/useProjectDashboard';

export const useEstimatesTableData = (projectId) => {
    const { estimates, isLoading, refresh } = useProjectDashboard(projectId);

    return {
        estimates,
        isLoading,
        refresh
    };
};
