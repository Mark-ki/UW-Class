'use client';
import React, { useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { fabric } from 'fabric';
import { Group } from 'fabric/fabric-impl';

const boxWidth = 200;
const boxHeight = 100;

class collegeClass {
    name: string;
    description: string;
    prereq: collegeClass[];
    box: Group | null = null;
    constructor(name: string, description: string, prereq?: collegeClass[]) {
        this.name = name;
        this.description = description;
        this.prereq = prereq || [];
    }
}

fabric.Line.prototype.evented = false; // Make lines non-interactive
fabric.Triangle.prototype.evented = false; // Make arrowheads non-interactive
var prereqLine = fabric.util.createClass({
    initialize: function(start: Group, end: Group) {
        this.start = start;
        this.end = end;

        this.line = new fabric.Line([start.left || 0, start.top || 0, end.left || 0, end.top || 0], {
            stroke: 'rgba(0, 0, 0, 1)',
            strokeWidth: 2,
            selectable: false
        });
        this.line.set({
            strokeDashArray: [5, 5], // Dashed line for a modern look
            stroke: 'rgba(50, 50, 50, 0.8)', // Softer stroke color
        });
        this.arrowHead = new fabric.Triangle({
            width: 20,
            height: 30,
            fill: 'rgba(0, 0, 0, 1)',
            strokeWidth: 2,
            selectable: false,
            originX: 'center',
            originY: 'center'
        });

        this.updateArrow();

        this.start.on('moving', () => {
            this.line.set({ y1: this.start.top, x1: this.start.left });
            this.updateArrow();
        });
        
        this.end.on('moving', () => {
            this.line.set({
                y2: this.end.top,
                x2: this.end.left
            });
            this.updateArrow();
        });
    },
    updateArrow: function() {
        const x1 = this.line.x1 || 0;
        const y1 = this.line.y1 || 0;
        const x2 = this.line.x2 || 0;
        const y2 = this.line.y2 || 0;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const retractDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2;

        const retractedX = x2 - retractDistance * Math.cos(angle);
        const retractedY = y2 - retractDistance * Math.sin(angle);

        this.arrowHead.set({
            left: retractedX,
            top: retractedY,
            angle: angle * (180 / Math.PI) + 90
        });
        this.arrowHead.setCoords(); // Ensure the arrowhead's position is updated
    }
});

var classBox = fabric.util.createClass({
    initialize: function(collegeClass: collegeClass, fabricCanvas: fabric.Canvas) {
        this.collegeClass = collegeClass;
        this.width = boxWidth;
        this.height = boxHeight;
        this.fill = 'rgb(100, 20, 20, 1)';
        this.text = new fabric.Text(collegeClass.name, { 
            left: 20,
            top: 20,
            fill: 'rgba(255, 255, 255, 1)', // White text for better contrast
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        });
        this.description = new fabric.Text(collegeClass.description, {
            left: 20,
            top: 50,
            fill: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white for description
            fontSize: 12,
            fontFamily: 'Arial, sans-serif'
        });
        this.rect = new fabric.Rect({
            fill: 'rgb(181, 0, 0)', // Modern blue color
            width: this.width,
            height: this.height,
            rx: 10, // Rounded corners
            ry: 10,
            shadow: new fabric.Shadow({
                color: 'rgba(0, 0, 0, 0.2)', // Subtle shadow
                blur: 15,
                offsetX: 5,
                offsetY: 5
            }),
            stroke: 'rgba(255, 255, 255, 0.6)', // Softer white stroke
            strokeWidth: 2,
        });

        this.group = new fabric.Group([ this.rect, this.text, this.description ], {
            left: 0,
            top: 0,
            hasControls: false,
            originX: 'center',
            originY: 'center',
        });

        collegeClass.box = this.group;
        this.lines = [];

        for(var i = 0; i < collegeClass.prereq.length; i++){
            console.log(collegeClass.prereq[0]);
            this.lines.push(new prereqLine(this.group, collegeClass.prereq[i].box || new fabric.Group()));
            fabricCanvas.add(this.lines[i].line);
            fabricCanvas.add(this.lines[i].arrowHead);
        }

        this.group.on('moving', (e) => {
            this.rect.set({ fill: 'rgb(199, 0, 0)' }); // Darker blue while moving
            if(!this.isMoving){
                if (!this.rotationInterval) {
                    this.rotationInterval = setInterval(() => {
                        const currentAngle = this.group.angle || 0;
                        const targetAngle = this.isRotatingBack ? -3 : 3;
                        this.group.rotate(targetAngle);
                        this.isRotatingBack = !this.isRotatingBack;
                        this.group.setCoords(); // Ensure coordinates update
                    }, 100); // Rotate every 500ms
                }
            }
            this.isMoving = true;

            this.group.setCoords(); // Ensure coordinates update
        });
        
        this.group.on('mouseup',  (e) => {
            if(this.isMoving){
                this.isMoving = false;
                clearInterval(this.rotationInterval); // Clear the rotation interval
                this.rotationInterval = null; // Reset the interval reference
                this.group.rotate(0); // Reset rotation to 0
                this.rect.set({ fill: 'rgb(181, 0, 0)' }); // Reset to original color
            } 
        });
    }
});

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    console.log("Page");

    useEffect(() => {
        console.log("useEffect");
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                
                if (fabricCanvasRef.current) return; // Prevent reinitialization
                const fabricCanvas = new fabric.Canvas("myCanvas");
                fabricCanvas.selection = false;
                fabricCanvas.setHeight(window.innerHeight*4/5);
                fabricCanvas.setWidth(window.innerWidth*2/3);
                fabricCanvas.setBackgroundColor('rgba(255, 255, 255, 1)', fabricCanvas.renderAll.bind(fabricCanvas));
                fabricCanvasRef.current = fabricCanvas;
                
                fabricCanvas.on('mouse:wheel', function(opt) {
                    var delta = opt.e.deltaY;
                    var zoom = fabricCanvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                })


                var isDragging = false;
                var selection = false;
                var lastPosX = 0;
                var lastPosY = 0;
                var vpt = fabricCanvas.viewportTransform;

                fabricCanvas.on('mouse:down', function(opt) {
                    console.log(opt.target);
                    if(opt.target) return;
                    var evt = opt.e;
                    isDragging = true;
                    selection = false;
                    lastPosX = evt.clientX;
                    lastPosY = evt.clientY;
                });

                fabricCanvas.on('mouse:move', function(opt) {
                    if (isDragging) {
                        var e = opt.e;
                        var vpt = fabricCanvas.viewportTransform;

                        if(vpt == null) return;

                        vpt[4] += e.clientX - lastPosX;
                        vpt[5] += e.clientY - lastPosY;
                        fabricCanvas.requestRenderAll();
                        lastPosX = e.clientX;
                        lastPosY = e.clientY;
                    }
                });

                fabricCanvas.on('mouse:up', function(opt) {
                    // on mouse up we want to recalculate new interaction
                    // for all objects, so we call setViewportTransform
                    if(opt.target) return;
                    // if(vpt == null) return;
                    if(fabricCanvas.viewportTransform == null) return;
                    fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
                    isDragging = false;
                    selection = true;
                });
                      

            }
        }

        
    }, []);

    const addObject = () => {
        const fabricCanvas = fabricCanvasRef.current;
        if(!fabricCanvas){
            return;
        }
        
        // var cs577 = new classBox(new collegeClass("CS 577", "This is a class.") , fabricCanvas);
        // fabricCanvas.add(cs577.group);


        var cs200 = new classBox(new collegeClass("CS 200", "This is a class."), fabricCanvas);
        var cs300 = new classBox(new collegeClass("CS 300", "This is a class.", [cs200.collegeClass]), fabricCanvas);
        var cs400 = new classBox(new collegeClass("CS 400", "This is a class.", [cs300.collegeClass]), fabricCanvas);
        var math354 = new classBox(new collegeClass("Math 354", "This is a class.", [cs400.collegeClass]), fabricCanvas);
        var cs577 = new classBox(new collegeClass("CS 577", "This is a class.", [cs400.collegeClass, math354.collegeClass]), fabricCanvas);
        fabricCanvas.add(cs300.group);
        // fabricCanvas.renderAll()
        fabricCanvas.add(cs400.group);
        fabricCanvas.add(math354.group);
        fabricCanvas.add(cs200.group);
        fabricCanvas.add(cs577.group);
    }

    return (
        <div className={styles.Wrapper + " h-full flex flex-row gap-8"}>
            {/* <p className={styles.label}>This is the main page.</p> */}
            <canvas className={styles.canvas} ref={canvasRef} id="myCanvas"></canvas>
            <div className='w-1/5 h-4/5 rounded-xl shadow-lg border-[3px] border-black bg-gray-100 border-l-2 border-gray-900'>
                <div className='w-full h-1/5 shadow-lg border-b-[3px] rounded-t-xl border-black bg-gray-100 border-gray-900 flex flex-col items-center justify-center'>
                    <input 
                        type="text" 
                        placeholder="Search classes..." 
                        className="w-11/12 p-2 rounded-md border border-gray-400"
                    />
                </div>
                <div className='w-full h-4/5 overflow-y-auto'>
                    <ul className="p-4">
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        <li className="buttons p-2 border-b border-gray-300">CS 200 - This is a class.
                            <button onClick={addObject} className="p-1 ml-2 bg-red-500 text-white rounded-md">Add</button>
                        </li>
                        
                    </ul>
                </div>
            </div>
        </div>
        
    );
  }