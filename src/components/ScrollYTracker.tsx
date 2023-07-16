import React, { useEffect, useRef } from "react";
import { useWindowScroll } from "react-use";

export const ScrollYTracker = React.memo(function ScrollTracker({
  limit,
  onPassLimit,
}: {
  limit: number;
  onPassLimit: (passed: boolean) => void;
}) {
  const { y } = useWindowScroll();
  const prevY = useRef<number>();

  useEffect(() => {
    if (prevY.current === undefined) {
      prevY.current = y;
      if (y > limit) onPassLimit(true);
    }
    if (y > limit && prevY.current <= limit) onPassLimit(true);
    else if (y <= limit && prevY.current > limit) onPassLimit(false);
    prevY.current = y;
  }, [limit, y, onPassLimit]);

  return null;
});
