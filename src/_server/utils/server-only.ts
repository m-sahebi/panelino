if (typeof window !== "undefined") {
  console.trace();
  throw new Error(
    "This module cannot be imported from a Client Component module. " +
      "It should only be used from a Server Component.",
  );
}
