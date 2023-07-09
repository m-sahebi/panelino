import { Category, Component, Palette, Variant } from "@react-buddy/ide-toolbox-next";
import AntdPalette from "@react-buddy/palette-antd";
import React, { Fragment } from "react";

export function ExampleLoaderComponent() {
  return <Fragment>Loading...</Fragment>;
}

export function PaletteTree() {
  return (
    <Palette>
      <Category name="App">
        <Component name="Loader">
          <Variant>
            <ExampleLoaderComponent />
          </Variant>
        </Component>
      </Category>
      <AntdPalette />
    </Palette>
  );
}
