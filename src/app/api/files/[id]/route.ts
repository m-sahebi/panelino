import { type Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import sanitize from "sanitize-filename";
import { getServerAuthSession } from "~/_server/lib/next-auth";
import { prisma } from "~/_server/lib/prisma";
import { IS_DEV } from "~/data/configs";

export type ApiFileGetResponseType = Blob;
export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const fileId = pathname.split("/").at(-1);
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { name: true, key: true },
    });

    if (!file) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const res = await fetch(`http:/localhost:9009/f/${file.key}`);
    if (!res.ok) {
      console.error(await res.json());
      return NextResponse.json({}, { status: 500 });
    }
    const blob = await res.blob();

    const headers = new Headers();
    headers.append("Content-Disposition", `inline; filename="${file.name}"`);
    return new Response(blob, { headers });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: IS_DEV ? e.toString() : "Something went wrong!" },
      { status: 500 },
    );
  }
}

export type ApiFileDeleteResponseType = { items: Prisma.FileGetPayload<{}> };
export async function DELETE(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({}, { status: 401 });

    const { pathname } = new URL(req.url);
    const fileId = pathname.split("/").at(-1);
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) return NextResponse.json({ message: "Not Found" }, { status: 404 });
    if (file.createdById !== session.user.id)
      return NextResponse.json({ message: "Not Found" }, { status: 404 });

    const res = await fetch(`http:/localhost:9009/f/${file.key}`, { method: "DELETE" });
    if (!res.ok) {
      console.error(await res.json());
      return NextResponse.json({}, { status: 500 });
    }

    await prisma.file.delete({ where: { id: fileId }, select: null });

    return NextResponse.json({ items: file });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: IS_DEV ? e.toString() : "Something went wrong!" },
      { status: 500 },
    );
  }
}

export type ApiFilePatchResponseType = { items: Prisma.FileGetPayload<{}> };
export async function PATCH(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({}, { status: 401 });

    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) return NextResponse.json({ message: "Not Found" }, { status: 404 });
    if (file.createdById !== session.user.id)
      return NextResponse.json({ message: "Not Found" }, { status: 404 });

    const reqBody = (await req.json()) as { name?: string };
    const name = sanitize(String(reqBody.name ?? ""));
    if (!name) return NextResponse.json({ message: "Invalid file name" }, { status: 400 });

    await prisma.file.update({ where: { id }, data: { name }, select: null });

    return NextResponse.json({ items: file });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: IS_DEV ? e.toString() : "Something went wrong!" },
      { status: 500 },
    );
  }
}
