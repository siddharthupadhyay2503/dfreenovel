import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Make sure this path points to your Prisma client
import { PrismaClient } from '@prisma/client';



export async function POST(req: Request) {
  try {
    const { url, owner } = await req.json(); // Extract URL and owner from the request body
    
    // Validate input data
    if (!url || !owner) {
      return new NextResponse("URL and owner are required", { status: 400 });
    }

    // Create a new link entry in the database
    const newLink = await db.link.create({
      data: {
        url,
        owner,
      },
    });

    return NextResponse.json(newLink);
  } catch (error) {
    console.error("LINK_POST_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all links, ordering by the most recent update
    const links = await db.link.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("LINK_GET_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
