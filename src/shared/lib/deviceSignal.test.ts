import { sha256Hex } from "./deviceSignal";

jest.mock("./session", () => ({ api: jest.fn() }));

describe("device hash", () => {
  it("matches the SHA-256 standard vectors, including a multi-block input", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(sha256Hex("a".repeat(100))).toBe(
      "2816597888e4a0d3a36b82b83316ab32680eb8f00f8cd3b904d681246d285a0e",
    );
  });

  it("gives a different hash for a different device", () => {
    expect(sha256Hex("android|34|1080x2400@3")).not.toBe(
      sha256Hex("android|34|1080x2340@3"),
    );
  });
});
