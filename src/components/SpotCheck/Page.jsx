import React from 'react';
import { PageLayout } from '../../layouts/PageLayout';
import { MainHeader } from "../Common/MainHeader";
import { Footer } from "@/layouts/footer";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyDataState } from "../common/EmptyDataState";
import { useQHSESpotCheckRegister } from '../../hooks/excel-data/use-qhse-spot-check-register';
import SpotCheckSummaryCards from './SpotCheckSummaryCards'; // Create this similar to DashSummaryCard/SummaryCards

const SpotCheckPage = () => {
  const { data: spotCheckData, loading, error, lastUpdated, refetch } = useQHSESpotCheckRegister();

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <MainHeader title="Spot Check Register" subtitle="Overview of all spot checks" />
        <LoadingState message="Loading spot check data..." />
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <MainHeader title="Spot Check Register" subtitle="Error loading spot check data" />
        <ErrorState error={error} onRetry={refetch} />
      </PageLayout>
    );
  }

  // Empty state
  if (!spotCheckData || spotCheckData.length === 0) {
    return (
      <PageLayout>
        <MainHeader title="Spot Check Register" subtitle="No spot check data available" />
        <EmptyDataState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <MainHeader
        title="Spot Check Register"
        subtitle="Overview of all spot checks"
        lastUpdated={lastUpdated}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
        {/* Summary Cards Section */}
        <section className="w-full">
          <SpotCheckSummaryCards spotCheckData={spotCheckData} />
        </section>
      </div>
   <Footer className="mt-6 sm:mt-8 md:mt-10 lg:mt-12" />
       </PageLayout>
  );
};

export default SpotCheckPage;