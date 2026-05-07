"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function UserMetaCard() {
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

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Admin Operator";
  const userRole = user?.user_metadata?.role || "System Administrator";
  const userAvatar = user?.user_metadata?.avatar_url || "/images/user/owner.jpg";
  const userLocation = user?.user_metadata?.location || "Neural Network";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
              <Image
                width={80}
                height={80}
                src={userAvatar}
                alt="user"
                className="object-cover h-full w-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-black uppercase tracking-widest text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                  {userRole}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                  {userLocation}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Social Links - Keeping structure but removing hardcoded branding if any */}
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[#00D2FF]/20 hover:text-[#00D2FF] transition-all lg:inline-flex lg:w-auto shadow-lg"
          >
            Modify Identity
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 p-4 lg:p-11 shadow-2xl">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">
              Identity Synchronization
            </h4>
            <p className="mb-6 text-sm font-bold text-gray-500 uppercase tracking-tighter lg:mb-7">
              Update your administrative profile for the Neural Network.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-black uppercase tracking-widest text-[#00D2FF] lg:mb-6">
                  Personal Matrix
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue={userName.split(' ')[0]} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" defaultValue={userName.split(' ')[1] || ""} />
                  </div>

                  <div className="col-span-2">
                    <Label>Neural Role</Label>
                    <Input type="text" defaultValue={userRole} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} className="font-black uppercase tracking-widest border-white/10 text-white">
                Abort
              </Button>
              <Button size="sm" onClick={handleSave} className="font-black uppercase tracking-widest">
                Commit Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
