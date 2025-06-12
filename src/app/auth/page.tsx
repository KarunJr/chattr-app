import Image from "next/image";
import AuthButtons from "./AuthButtons";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) return redirect("/");

  return (
    <>
      <div className="min-h-screen w-full flex bg-[#ebecf5] dark:bg-gray-950 dark:text-white">
        <div className="xl:w-1/2 w-full flex flex-col items-center">
          <h1 className="text-7xl font-extrabold font-sans text-indigo-500 tracking-tight drop-shadow-md text-center mt-60">
            Chat<span className="text-emerald-400">rr</span>
          </h1>
          <p className="mt-2 text-lg text-gray-400 font-medium tracking-wide text-center">
            Fast chats, real connections.
          </p>
          <AuthButtons />
        </div>

        <div className="w-1/2 hidden xl:flex">
          <div className="w-full h-full relative overflow-hidden">
            <Image
              src={"/hero-right.jpg"}
              alt="hero-right"
              fill
              className="object-cover dark:opacity-60 opacity-90 pointer-events-none select-none h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
