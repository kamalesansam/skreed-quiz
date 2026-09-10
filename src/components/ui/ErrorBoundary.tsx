'use client';

import React from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { failed: boolean };

/** Wraps the 3D layers so a WebGL failure never takes the quiz down with it. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.warn('[skreed-quiz] 3D layer failed, falling back to flat UI', error);
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
