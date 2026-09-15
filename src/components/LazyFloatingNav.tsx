"use client";

import dynamic from "next/dynamic";

// FloatingNav stays hidden until the visitor scrolls past the FAQ/footer, so
// it doesn't need to be in the initial JS bundle. Deferring it here keeps
// framer-motion (which it pulls in) out of every page's critical bundle.
const FloatingNav = dynamic(() => import("./FloatingNav"), { ssr: false });

export default FloatingNav;
