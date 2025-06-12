"use server";

import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { pusherServer } from "@/lib/pusher";

type SendMessageAction = {
  content: string;
  receiverId: string;
  messageType: "text" | "image";
};

export async function sendMessageAction({
  content,
  messageType,
  receiverId,
}: SendMessageAction) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false, message: "User not authenticated" };

  const senderId = user.id;

  const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`

  const conversationExist = await redis.exists(conversationId)

  if(!conversationExist){
    await redis.hset(conversationId, {
        parricipation1: senderId,
        parricipation2: receiverId,
    })

    await redis.sadd(`user:${senderId}:conversations`, conversationId)
    await redis.sadd(`user:${receiverId}:conversations`, conversationId)
  }

  //generate a unique message id;
  const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2,9)}`
  const timeStamp = Date.now()

  await redis.hset(messageId,{
    senderId,
    receiverId,
    content,
    timeStamp,
    messageType
  })

  await redis.zadd(`${conversationId}:message`,{score:timeStamp, member:JSON.stringify(messageId)})

  const channelName = `${senderId}__${receiverId}`.split('__').sort().join('__')

  await pusherServer?.trigger(channelName, 'newMessage',{
    message: {senderId, content, timeStamp, messageType},
  })

  return {success: true, conversationId, messageId}
}

// Issue when making conversation id:

// John, Jane
// 123,  456

// John send message to Jane
// senderId: 123, receiverId: 456
// conversation: 123:456

// Jane send message to John
// senderId: 456, receiverId: 123
// conversation: 456:123 

//here the issue is conversation id is not matching even they are messaging with same id the key is zigzag we have to solve this by sorting 


export async function getMessages(selectedUserId: string, currentUserId: string){
  // conversation:kp_2a76df512e2a41019ae71513c3423716:kp_9acf30914e3e4ff79cab66f584d4205c:message
  const conversationId = `conversation:${[selectedUserId, currentUserId].sort().join(":")}`
  const messageIds = await redis.zrange(`${conversationId}:message`, 0, -1)
  //messageIds is a key where the message are stored [message:1749292528292:m9of7td]
  if(messageIds.length === 0) return [];

  const pipeline = await redis.pipeline()
  messageIds.forEach((messageId)=> pipeline.hgetall(messageId as string));
  const messages = (await pipeline.exec()) as Message[];

  return messages;
}