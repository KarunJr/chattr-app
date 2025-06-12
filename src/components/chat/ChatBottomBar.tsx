import { AnimatePresence, motion } from "framer-motion";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { pusherClient } from "@/lib/pusher";
import {
  Image as ImageIcon,
  Loader,
  SendHorizontal,
  ThumbsUp,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import EmojiPicker from "./EmojiPicker";
import { Button } from "../ui/button";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreference";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageAction } from "@/actions/message.action";
import { useSelectedUser } from "@/store/useSelectedUser";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Message } from "@/db/dummy";

const ChatBottomBar = () => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { soundEnabled } = usePreferences();
  const queryClient = useQueryClient();
  const { selectedUser } = useSelectedUser();
  const { user:currentUser } = useKindeBrowserClient()
  const [imageUrl, setImageUrl] = useState("");

  const [playSound1] = useSound("sounds/public_sounds_keystroke1.mp3");
  const [playSound2] = useSound("sounds/public_sounds_keystroke2.mp3");
  const [playSound3] = useSound("sounds/public_sounds_keystroke3.mp3");
  const [playSound4] = useSound("sounds/public_sounds_keystroke4.mp3");
  const [playNotificationSound] = useSound("sounds/public_sounds_notification.mp3")

  const playSoundFunction = [playSound1, playSound2, playSound3, playSound4];
  const playSoundKeyStroke = () => {
    const randomIndex = Math.floor(Math.random() * playSoundFunction.length);
    soundEnabled && playSoundFunction[randomIndex]();
  };

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: sendMessageAction,
  });

  const handleSendMessage = () => {
    console.log("clicked");
    if (!message.trim()) return;

    sendMessage({
      content: message,
      messageType: "text",
      receiverId: selectedUser?.id!,
    });

    setMessage("");

    textAreaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setMessage(message + "\n");
    }
  };


  useEffect(()=>{
    const channelName = `${currentUser?.id}__${selectedUser?.id}`.split('__').sort().join('__');
    const channel = pusherClient?.subscribe(channelName);

    const handleNewMessage = (data:{message: Message})=>{
      queryClient.setQueryData(["messages", selectedUser?.id], (oldMessages: Message[]) => {
        return[...oldMessages, data.message]
      })

    if(soundEnabled && data.message.senderId !== currentUser?.id){
      playNotificationSound();
    }
    }


    channel?.bind("newMessage", handleNewMessage)

    // ! Absolutely important, otherwiswe the event listener will be added multiple times which means you'll see the incoming new message multiple times
    return ()=> {
      channel?.unbind("newMessage", handleNewMessage)
      pusherClient?.unsubscribe(channelName)
    }
  }, [selectedUser?.id, currentUser?.id, queryClient, playNotificationSound, soundEnabled])

  
  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      {!message.trim() && (
        <CldUploadWidget
          signatureEndpoint={"api/sign-cloudinary-params"}
          onSuccess={(result, { widget }) => {
            setImageUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <ImageIcon
                size={20}
                className="cursor-pointer text-muted-foreground transition-all duration-300 ease-in-out"
                onClick={() => open()}
              />
            );
          }}
        </CldUploadWidget>
      )}
      <Dialog open={!!imageUrl}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center relative h-96 w-full mx-auto">
            <Image
              src={imageUrl}
              alt="Image Preview"
              fill
              className="object-contain"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                sendMessage({
                  content: imageUrl,
                  messageType: "image",
                  receiverId: selectedUser?.id!,
                });
                setImageUrl("");
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        <motion.div
          key={"image"}
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
          className="w-full relative"
        >
          <Textarea
            autoComplete="off"
            placeholder="Aa"
            rows={1}
            className="w-full border rounded-lg flex items-center h-9 resize-none overflow-hidden bg-background min-h-0"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              playSoundKeyStroke();
            }}
            onKeyDown={handleKeyDown}
            ref={textAreaRef}
          />
          <div className="absolute right-2 bottom-0.5">
            <EmojiPicker
              onChange={(emoji) => {
                setMessage(message + emoji);
                if (textAreaRef.current) {
                  textAreaRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {message.trim() ? (
          <Button
            className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0 cursor-pointer"
            variant={"ghost"}
            size={"icon"}
            onClick={() => handleSendMessage()}
          >
            <SendHorizontal size={20} className="text-muted-foreground" />
          </Button>
        ) : (
          <Button
            className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0 cursor-pointer"
            variant={"ghost"}
            size={"icon"}
          >
            <div
              className="text-muted-foreground dark:hover:text-white"
              onClick={() => {
                sendMessage({
                  content: "👍",
                  messageType: "text",
                  receiverId: selectedUser?.id!,
                });
              }}
            >
              {!isPending && <ThumbsUp size={20} className="ml-2" />}
            </div>

            <div>
              {isPending && (
                <Loader
                  size={20}
                  className="text-muted-foreground animate-spin mr-2"
                />
              )}
            </div>
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBottomBar;
