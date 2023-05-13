import { ZodEnumDef, ZodNativeEnumDef, ZodObject } from "zod";
import { FlowModel } from "@/data/models/flow";
import { PostModel } from "@/data/models/post";
import { UserModel } from "@/data/models/user";
import { zGetSchemaKeysListAndMeta, ZodPrimitiveDef } from "@/utils/zod";

export const ModelsList = [UserModel, FlowModel, PostModel] as const;

type ModelType = (typeof ModelsList)[number];

type ModelsInfoType<K extends number> = Map<
  (typeof ModelsList)[K],
  {
    keysList: ReturnType<(typeof ModelsList)[K]["keyof"]>["options"];
    keysMeta: Record<
      keyof (typeof ModelsList)[K]["shape"],
      ZodPrimitiveDef | ZodNativeEnumDef | ZodEnumDef
    >;
  }
>;

export const ModelsInfo: ModelsInfoType<number> = ModelsList.reduce(
  (acc, val) => {
    const [keysList, keysMeta] = zGetSchemaKeysListAndMeta(
      val as ZodObject<any>
    );
    acc.set(val, { keysList, keysMeta });
    return acc;
  },
  new Map()
);
