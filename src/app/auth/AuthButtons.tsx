"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

const AuthButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="mt-5 flex gap-3 flex-1 md:flex-row flex-col relative z-50 justify-center">
      <RegisterLink className="flex-1">
        <Button
          className="w-full cursor-pointer"
          variant={"outline"}
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
        >
          Sign up
        </Button>
      </RegisterLink>

      <LoginLink className="flex-1">
        <Button
          className=" cursor-pointer"
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
        >
          Login
        </Button>
      </LoginLink>
    </div>
  );
};

export default AuthButtons;
