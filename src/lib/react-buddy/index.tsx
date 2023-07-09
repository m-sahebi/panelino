import React from "react";
import { useInitial } from "./useInitial";

const ComponentPreviews = React.lazy(() => import("./ComponentPreviews"));

export { ComponentPreviews, useInitial };
