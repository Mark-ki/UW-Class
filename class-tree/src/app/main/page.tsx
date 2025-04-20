import React from "react";
import Canvas from "./canvas";
import NoSsr from "../components/noSsr";

export default function CanvasPage() {
    return (
        <div className="canvasPage">
        <NoSsr><Canvas></Canvas></NoSsr>
        </div>
    );
}