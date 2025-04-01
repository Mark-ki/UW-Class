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

var prereqLine = fabric.util.createClass({
    initialize: function(start: Group, end: Group) {
        this.start = start;
        this.end = end;

        this.line = new fabric.Line([start.left || 0, start.top || 0, end.left || 0, end.top || 0], {
            stroke: 'rgba(0, 0, 0, 1)',
            strokeWidth: 2,
            selectable: false
        });

        this.arrowHead = new fabric.Triangle({
            width: 10,
            height: 15,
            fill: 'rgba(0, 0, 0, 1)',
            strokeWidth: 2,
            selectable: false,
            originX: 'center',
            originY: 'center'
        });

        this.updateArrow();

        this.start.on('moving', () => {
            this.line.set({ y1: this.start.top + 50, x1: this.start.left + 100 });
            this.updateArrow();
        });

        this.end.on('moving', () => {
            this.line.set({ y2: this.end.top + 50, x2: this.end.left + 100 });
            this.updateArrow();
        });
    },
    updateArrow: function() {
        const x1 = this.line.x1 || 0;
        const y1 = this.line.y1 || 0;
        const x2 = this.line.x2 || 0;
        const y2 = this.line.y2 || 0;

        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        this.arrowHead.set({
            left: x2,
            top: y2,
            angle: angle + 90
        });
    }
});

var classBox = fabric.util.createClass({
    initialize: function(collegeClass: collegeClass, fabricCanvas: fabric.Canvas) {
        this.collegeClass = collegeClass;
        this.width = boxWidth;
        this.height = boxHeight;
        this.fill = 'rgb(100, 20, 20, 1)';
        this.text = new fabric.Text(collegeClass.name, { 
            left: 25,
            top: 25,
            fill: 'rgba(255, 255, 255, 1)' // Change the color to blue
        });
        this.rect = new fabric.Rect({
            fill: 'rgba(165, 0, 33, 1)',
            width: this.width,
            height: this.height,
            rx: 5,
            ry: 5,
            shadow: new fabric.Shadow({
                color: 'rgba(0, 0, 0, 0.3)',
                blur: 10,
                offsetX: 5,
                offsetY: 5
            }),
            stroke: 'rgba(255, 255, 255, 0.5)',
            strokeWidth: 1,
        });

        this.arrowTarget = new fabric.Circle({
            radius: 5,
            fill: 'rgba(0, 0, 0, 0)', // Transparent fill
            stroke: 'rgba(0, 0, 0, 0.5)', // Slightly visible border
            strokeWidth: 1,
            left: this.width / 2 - 5,
            top: this.height - 5,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
        });

        this.group = new fabric.Group([ this.rect, this.text, this.arrowTarget ], {
            left: 0,
            top: 0,
            hasControls: false
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
            this.rect.set({ fill: 'rgb(153, 0, 31)' });
            if(!this.isMoving){
                this.group.set({
                    scaleX: this.group.scaleX * 1.1,
                    scaleY: this.group.scaleY * 1.1
                });
            }
            this.isMoving = true;

            this.group.on('moving', () => {
                this.group.setCoords(); // Ensure coordinates update
            });
        });
        
        this.group.on('mouse:up',  (e) => {
            if(this.isMoving){
                this.isMoving = false;
                this.group.set({
                    scaleX: this.group.scaleX * 1/1.1,
                    scaleY: this.group.scaleY * 1/1.1
                });
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
                        <li className="buttons p-2 border-b border-gray-300">CS 300 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 400 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">Math 354 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                        <li className="buttons p-2 border-b border-gray-300">CS 577 - This is a class.</li>
                    </ul>
                </div>
            </div>
        </div>
        
    );
  }