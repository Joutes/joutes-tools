import { getAllErratas } from "@/lib/data/erratas";
import AddErrataDialog from "./AddErrataDialog";
import ErratasClientView from "./ErratasClientView";
import { hasPermission } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function RiftboundErratasPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const erratas = await getAllErratas(userId);
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
      />
    </div>
  );
}