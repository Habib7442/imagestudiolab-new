"use client";

import React, { forwardRef, useCallback, useRef } from "react";
import HTMLFlipBook from "react-pageflip";

interface FlipBookProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onFlip?: (e: any) => void;
}

const FlipBook = forwardRef<any, FlipBookProps>((props, ref) => {
  return (
    // @ts-ignore - react-pageflip types can be finicky
    <HTMLFlipBook
      width={props.width}
      height={props.height}
      size="stretch"
      minWidth={300}
      maxWidth={1000}
      minHeight={400}
      maxHeight={1533}
      maxShadowOpacity={0.5}
      showCover={true}
      mobileScrollSupport={true}
      onFlip={props.onFlip}
      ref={ref}
      className="mx-auto shadow-2xl"
      style={{ margin: "0 auto" }}
    >
      {props.children}
    </HTMLFlipBook>
  );
});

FlipBook.displayName = "FlipBook";

export default FlipBook;
