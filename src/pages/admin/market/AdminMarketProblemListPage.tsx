import { PageContainer } from '@/shared/ui/page-container';
import { PageHeader } from '@/shared/ui/page-header';

export default function AdminMarketProblemListPage() {
  return (
    <PageContainer>
      <PageHeader title="문제 마켓 목록" description="처리가 필요한 문제 마켓 목록" />
      <div className="space-y-6">
        <p>관리자 문제 마켓 목록 페이지입니다.</p>
        {/* TODO: 마켓 담당자 구현 예정 */}
      </div>
    </PageContainer>
  );
}
