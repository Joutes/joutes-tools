import { getAllErratas } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import AddErrataDialog from "./AddErrataDialog";
import ErratasClientView from "./ErratasClientView";
import {hasPermission} from "@/lib/permissions";

export default async function RiftboundErratasPage() {
  const erratas = await getAllErratas();
  const userCanUpdateErratas = await hasPermission('erratas:update');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Erratas & Clarifications Riftbound</h1>
        {userCanUpdateErratas && <AddErrataDialog />}
      </div>

      <ErratasClientView
        erratas={erratas}
        userCanUpdateErratas={userCanUpdateErratas}
      />
    </div>
  );
}