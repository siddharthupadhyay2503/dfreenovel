import { Server as NetServer } from "node:http";
import { NextApiRequest } from "next";
import { Server as ServerIO, Socket } from "socket.io";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";

// export const runtime = "nodejs"; // This should stay

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };


const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
    });

    io.on("connection", (socket: Socket) => {
      // Handle joining a channel
      socket.on("joinChannel", async ({ userId, channelId }) => {
        socket.join(channelId);
      });

      // Handle sending a message
      socket.on("sendMessage", async ({ channelId, message, senderId }) => {
        const newMessage = await db.message.create({
          data: {
            content: message,
            memberId: senderId,
            channelId,
          },
        });

        // Emit new message to channel members
        io.to(channelId).emit("newMessage", newMessage);

        // Update unread message count for other members
        const otherMembers = await db.member.findMany({
          where: { serverId: channelId, id: { not: senderId } },
        });
        otherMembers.forEach(member => {
          io.to(member.id).emit("unreadCountUpdated", { channelId });
        });
      });

      // Mark messages as read
      socket.on("markAsRead", async ({ userId, channelId }) => {
        const now = new Date();

        // Mark all unseen messages in the channel as seen for this user
        await db.seenStatus.updateMany({
          where: {
            userId,
            message: {
              channelId, // Make sure this field exists in the Message model
            },
          },
          data: {
            seenAt: now,
          },
        });

        // Emit seen status to other users
        io.to(channelId).emit("messagesSeen", { userId, channelId });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
