"use client"
import { checkAuthStatus } from "@/actions/auth.action";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => await checkAuthStatus(),
  });


  useEffect(() => {
    if(data?.success) router.push("/")
  }, [data, router])
  
  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <Loader className="animate-spin w-10 h-10 text-muted-foreground" />

        <h3 className="text-xl font-bold">Redirecting...</h3>
        <p>Please wait</p>
      </div>
    </div>
  );
};

export default Page;
