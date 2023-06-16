import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "~/_server/lib/next-auth";
import { prisma } from "~/_server/lib/prisma";
import { FILE_UPLOAD_SIZE_LIMIT, IS_DEV } from "~/data/configs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("myFile") as Blob | null;
  if (!file) {
    return NextResponse.json({ message: "File blob is required." }, { status: 400 });
  }
  if (file.size > FILE_UPLOAD_SIZE_LIMIT)
    return NextResponse.json({ message: "File should be smaller than 5mb" }, { status: 400 });
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({}, { status: 401 });

    const res = await fetch("http://localhost:9009/f/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ message: err.message }, { status: res.status });
    }

    const data = (await res.json()) as { fileName: string; mimeType: string; size: number };

    const f = await prisma.file.create({
      data: { key: data.fileName, createdById: session.user.id, mimeType: data.mimeType },
    });
    return NextResponse.json(f, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: IS_DEV ? e.toString() : "Something went wrong!" },
      { status: 500 },
    );
  }
}
