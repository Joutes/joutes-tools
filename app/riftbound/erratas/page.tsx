import { getAllErratas, countAllErratas } from "@/lib/data/erratas";
import AddErrataDialog from "./AddErrataDialog";
import ErratasClientView from "./ErratasClientView";
import { hasPermission } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const PAGE_SIZE = 20;

export default async function RiftboundErratasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [erratas, totalCount] = await Promise.all([
    getAllErratas({ userId, offset, limit: PAGE_SIZE }),
    countAllErratas(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const userCanUpdateErratas = await hasPermission('erratas:update');
  const userCanVoteErratas = await hasPermission('erratas:vote');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Erratas & Clarifications Riftbound</h1>
        {userCanUpdateErratas && <AddErrataDialog />}
      </div>

      <ErratasClientView
        erratas={erratas}
        userCanUpdateErratas={userCanUpdateErratas}
        userCanVoteErratas={userCanVoteErratas}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}