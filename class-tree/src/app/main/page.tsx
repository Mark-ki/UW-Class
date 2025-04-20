import React from "react";
import Canvas from "./canvas";
import noSsr from "../components/noSsr";
import NoSsr from "../components/noSsr";

export default function CanvasPage() {
    return (
        <div className="canvasPage">
        <NoSsr><Canvas></Canvas></NoSsr>
        </div>
    );
}