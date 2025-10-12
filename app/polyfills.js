import { Platform } from "react-native";
import structuredClone from "@ungap/structured-clone";
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions";
import {
  TextEncoderStream,
  TextDecoderStream,
} from "@stardazed/streams-text-encoding";

if (Platform.OS !== "web") {
  if (!("structuredClone" in global)) {
    polyfillGlobal("structuredClone", () => structuredClone);
  }

  if (!("TextEncoderStream" in global)) {
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
  }

  if (!("TextDecoderStream" in global)) {
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
  }
}

export {};
