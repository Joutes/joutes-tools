import { getAllErratas } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import AddErrataDialog from "./AddErrataDialog";
import ErratasClientView from "./ErratasClientView";

export default async function RiftboundErratasPage() {
  const erratas = await getAllErratas();
  const userIsAdmin = await isAdmin();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Erratas & Clarifications Riftbound</h1>
        {userIsAdmin && <AddErrataDialog />}
      </div>

      <ErratasClientView
        erratas={erratas}
        userIsAdmin={userIsAdmin}
      />
    </div>
  );
}