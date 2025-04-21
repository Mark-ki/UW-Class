import React from "react";
import dynamic from 'next/dynamic';
const Canvas = dynamic(() => import('./canvas'), { ssr: false });

export default function CanvasPage() {
    return (
        <div className="canvasPage">
        <Canvas></Canvas>
        </div>
    );
}