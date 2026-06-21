import { useParams } from 'react-router-dom';

import { AdminMarketManagementView } from './AdminMarketManagementView';
import { PageContainer } from '@/shared/ui/page-container';
import { PageHeader } from '@/shared/ui/page-header';

export default function AdminMarketResultPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const numericMarketId = Number(marketId);

  return (
    <PageContainer>
      <PageHeader title="마켓 결과 확정" description={`마켓 ID: ${marketId}`} />
      <AdminMarketManagementView marketId={numericMarketId} />
    </PageContainer>
  );
}
