import { type Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "~/_server/lib/next-auth";
import { prisma } from "~/_server/lib/prisma";
import { FILE_UPLOAD_SIZE_LIMIT, IS_DEV } from "~/data/configs";
import { formatBytes } from "~/utils/primitive";

export type ApiFilePostResponseType = { items: Prisma.FileGetPayload<{}> };
export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const formData = await req.formData();

  const file = formData.get("myFile") as Blob | null;
  if (!file) {
    return NextResponse.json({ message: "File blob is required." }, { status: 400 });
  }
  if (file.size > FILE_UPLOAD_SIZE_LIMIT)
    return NextResponse.json(
      { message: `File should be smaller than ${formatBytes(FILE_UPLOAD_SIZE_LIMIT)}` },
      { status: 400 },
    );
  try {
    const res = await fetch("http://localhost:9009/f/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = (await res.json()) as { message: string };
      return NextResponse.json({ message: err.message }, { status: res.status });
    }

    const data = (await res.json()) as {
      fileName: string;
      mimeType: string;
      size: number;
      originalName: string;
    };

    const f = await prisma.file.create({
      data: {
        key: data.fileName,
        name: data.originalName,
        createdById: session.user.id,
        mimeType: data.mimeType,
        size: +data.size,
      },
    });
    return NextResponse.json({ items: f }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        message: IS_DEV
          ? e.cause?.code === "ECONNREFUSED"
            ? "Can't connect to file server"
            : e.toString()
          : "Something went wrong!",
      },
      { status: 500 },
    );
  }
}

export type ApiFilesGetResponseType = { items: Prisma.FileGetPayload<{}>[] };
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({}, { status: 401 });

    const files = await prisma.file.findMany({ where: { createdById: session.user.id } });

    return NextResponse.json({ items: files });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        message: IS_DEV
          ? e.cause?.code === "ECONNREFUSED"
            ? "Can't connect to file server"
            : e.toString()
          : "Something went wrong!",
      },
      { status: 500 },
    );
  }
}
