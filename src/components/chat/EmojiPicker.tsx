"use client";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SmileIcon } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

interface EmojiPickerProps{
  onChange: (emoji: string) => void;
}

type EmojiType = {
  native: string;
};

const EmojiPicker = ({onChange}:EmojiPickerProps) => {
  const { theme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger>
        <SmileIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
      </PopoverTrigger>

      <PopoverContent className="w-full">
        <Picker
          emojiSize={18}
          data={data}
          maxFrequentRow={1}
          theme={theme === "dark" ? "dark" : "light"}
          onEmojiSelect={(emoji: EmojiType) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
