"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { createClient } from "@/utils/supabase/client";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  const country = user?.user_metadata?.country || "Earth Sector";
  const city = user?.user_metadata?.city || "Neural Node 01";
  const postalCode = user?.user_metadata?.postal_code || "ENCRYPTED";
  const taxId = user?.user_metadata?.tax_id || "NULLBYTE-XXXX";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-black uppercase tracking-widest text-[#00D2FF] mb-6">
              Geospatial Uplink
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Global Sector (Country)
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Local Node (City/State)
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {city}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Routing Protocol (Postal Code)
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {postalCode}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Neural ID Signature (TAX ID)
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {taxId}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#00D2FF]/20 hover:text-[#00D2FF] transition-all lg:inline-flex lg:w-auto shadow-lg"
          >
            Update Coordinates
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 p-4 lg:p-11 shadow-2xl">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">
              Recalibrate Coordinates
            </h4>
            <p className="mb-6 text-sm font-bold text-gray-500 uppercase tracking-tighter lg:mb-7">
              Adjust your geospatial routing within the Neural Network.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Global Sector</Label>
                  <Input type="text" defaultValue={country} />
                </div>

                <div>
                  <Label>Local Node</Label>
                  <Input type="text" defaultValue={city} />
                </div>

                <div>
                  <Label>Routing Protocol</Label>
                  <Input type="text" defaultValue={postalCode} />
                </div>

                <div>
                  <Label>Neural Signature</Label>
                  <Input type="text" defaultValue={taxId} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} className="font-black uppercase tracking-widest border-white/10 text-white">
                Abort
              </Button>
              <Button size="sm" onClick={handleSave} className="font-black uppercase tracking-widest">
                Confirm
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
