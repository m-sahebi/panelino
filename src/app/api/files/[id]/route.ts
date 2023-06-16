import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/_server/lib/next-auth";
import { prisma } from "~/_server/lib/prisma";
import { IS_DEV } from "~/data/configs";

export async function GET(req: Request) {
  try {
    // const session = await getServerAuthSession();
    // if (!session) return NextResponse.json({}, { status: 401 });

    const { pathname } = new URL(req.url);
    const fileId = pathname.split("/").at(-1);
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    // if (file.createdById !== session.user.id) return NextResponse.json({}, { status: 403 });

    const res = await fetch(`http:/localhost:9009/f/${file.key}`);
    if (!res.ok) {
      console.error(await res.json());
      return NextResponse.json({}, { status: 500 });
    }
    const blob = await res.blob();

    return new Response(blob);
  } catch (e) {
    console.error(e);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({}, { status: 401 });

    const { pathname } = new URL(req.url);
    const fileId = pathname.split("/").at(-1);
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if (file.createdById !== session.user.id) return NextResponse.json({}, { status: 403 });

    const res = await fetch(`http:/localhost:9009/f/${file.key}`, { method: "DELETE" });
    if (!res.ok) {
      console.error(await res.json());
      return NextResponse.json({}, { status: 500 });
    }

    await prisma.file.delete({ where: { id: fileId }, select: null });

    return NextResponse.json(file, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: IS_DEV ? e.toString() : "Something went wrong!" });
  }
}
