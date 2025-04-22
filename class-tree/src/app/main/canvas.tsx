'use client';
import React, { useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { fabric } from 'fabric';
import { Group } from 'fabric/fabric-impl';
import ListItem from './listItem';
import { useState } from 'react';

const boxWidth = 200;
const boxHeight = 100;

let activeClasses: collegeClass[] = [];

class collegeClass {
    name: string;
    description: string;
    prereq: collegeClass[];
    uninitializedPrereq: string[] = [];
    box: Group | null = null;
    boxData: any = null;
    constructor(name: string, description: string, prereq?: collegeClass[], uninitializedPrereq?: string[]) {
        this.uninitializedPrereq = uninitializedPrereq || [];
        this.name = name;
        this.description = description;
        this.prereq = prereq || [];
    }
}

fabric.Line.prototype.evented = false; // Make lines non-interactive
fabric.Triangle.prototype.evented = false; // Make arrowheads non-interactive
let prereqLine = fabric.util.createClass({
    initialize: function(start: Group, end: Group, startData: collegeClass) {
        this.startData = startData;
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

let classBox = fabric.util.createClass({
    initialize: function(collegeClass: collegeClass, fabricCanvas: fabric.Canvas) {
        this.collegeClass = collegeClass;
        this.width = boxWidth;
        this.height = boxHeight;
        this.fill = 'rgb(100, 20, 20, 1)';
        this.lines = [] as InstanceType<typeof prereqLine>[];
        this.linesIn = [] as InstanceType<typeof prereqLine>[];
        this.text = new fabric.Textbox(collegeClass.name, { 
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
            left: Math.random() * (1000 - 300) + 300,
            top: Math.random() * (500 - 300) + 300,
            hasControls: false,
            originX: 'center',
            originY: 'center',
        });

        collegeClass.box = this.group;
        collegeClass.boxData = this;
        

        for(let i = 0; i < collegeClass.prereq.length; i++){
            // console.log(collegeClass.prereq[0]);
            let curr = new prereqLine(this.group, collegeClass.prereq[i].box || new fabric.Group(), this.collegeClass);
            this.lines.push(curr);
            collegeClass.prereq[i].boxData?.linesIn?.push(curr);
            // console.log((collegeClass.prereq[i].box?.lines));
            // (collegeClass.prereq[i].box as CustomGroup).lines?.push(curr);
            // fabricCanvas.add(this.lines[i].line);
            // fabricCanvas.add(this.lines[i].arrowHead);
            fabricCanvas.add(curr.line);
            fabricCanvas.add(curr.arrowHead);

            // this.lines[i].line.sendToBack();
            // this.lines[i].arrowHead.sendToBack();

            curr.line.sendToBack();
            curr.arrowHead.sendToBack();
        }

        for (let cls of activeClasses) {
            // cls.prereq.forEach((prereq: collegeClass) => {console.log(prereq.name)});
            if (cls.uninitializedPrereq.includes(collegeClass.name)) {
                // console.log(cls.name)
                cls.uninitializedPrereq = cls.uninitializedPrereq.filter((name: string) => name !== collegeClass.name);
                cls.prereq.push(collegeClass);
                let curr = new prereqLine(cls.box || new fabric.Group(), this.group, cls);
                this.linesIn.push(curr);
                cls.boxData?.lines.push(curr);
                fabricCanvas.add(curr.line);
                fabricCanvas.add(curr.arrowHead);

                curr.line.sendToBack();
                curr.arrowHead.sendToBack();
            }
        }

        this.group.on('moving', (e: any) => {
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
        
        this.group.on('mouseup',  (e: any) => {
            if(this.isMoving){
                this.isMoving = false;
                clearInterval(this.rotationInterval); // Clear the rotation interval
                this.rotationInterval = null; // Reset the interval reference
                this.group.rotate(0); // Reset rotation to 0
                this.rect.set({ fill: 'rgb(181, 0, 0)' }); // Reset to original color
            } 
        });

        this.group.on("mousedblclick", (e: any) => {
            fabricCanvas.remove(this.group);
            this.lines.forEach((line: { line: fabric.Object; arrowHead: fabric.Object; }) => {
                fabricCanvas.remove(line.line);
                fabricCanvas.remove(line.arrowHead);
            });

            this.linesIn.forEach((line: { line: fabric.Object; arrowHead: fabric.Object; startData: collegeClass }) => {
                fabricCanvas.remove(line.line);
                fabricCanvas.remove(line.arrowHead);
                line.startData.uninitializedPrereq.push(this.collegeClass.name);
            });
            activeClasses = activeClasses.filter(cls => cls !== this.collegeClass);

        });
    }
});

export default function Canvas() {
    const [classes, setClasses] = React.useState<{ name: string; req?: string[] }[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    useEffect(() => {

        setClasses([{ name: "CS200" },
            { name: "CS300", req: ["CS200"] },
            { name: "CS400", req: ["CS300"] },
            { name: "Math354", req: ["CS400"] },
            { name: "CS500", req: ["Math354", "CS400"] },
            { name: "CS600" },
            { name: "Math101" },
            { name: "Physics201", req: ["Math101"] },
            { name: "Chemistry301", req: ["Physics201"] },
            { name: "Biology401", req: ["Chemistry301"] },
        ]);


        const fetchClasses = async () => {
            try {
                const response = await fetch('/api/classes'); // Replace with your API endpoint
                const data = await response.json();
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };
    
        fetchClasses();
    }, []);

    useEffect(() => {
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
                    let delta = opt.e.deltaY;
                    let zoom = fabricCanvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 20) zoom = 20;
                    if (zoom < 0.01) zoom = 0.01;
                    fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                })


                let isDragging = false;
                let selection = false;
                let lastPosX = 0;
                let lastPosY = 0;
                let vpt = fabricCanvas.viewportTransform;

                fabricCanvas.on('mouse:down', function(opt) {
                    // console.log(opt.target);
                    if(opt.target) return;
                    let evt = opt.e;
                    isDragging = true;
                    selection = false;
                    lastPosX = evt.clientX;
                    lastPosY = evt.clientY;
                });

                fabricCanvas.on('mouse:move', function(opt) {
                    if (isDragging) {
                        let e = opt.e;
                        let vpt = fabricCanvas.viewportTransform;

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

    const addObject = (name:string , req?:string[]) => {
        const fabricCanvas = fabricCanvasRef.current;
        if(!fabricCanvas){
            return;
        }

        if(activeClasses.find((cls) => cls.name === name)){
            return;
        }

        let requiredClasses: collegeClass[] = [];
        let uninitializedClasses: string[] = [];
        // Put required class that's not created yet in another array
        if (req) {
            for (let className of req) {
            const existingClass = activeClasses.find(cls => cls.name === className);
            if (existingClass) {
                requiredClasses.push(existingClass);
            } else {
                uninitializedClasses.push(className);
            }
            }
        }

        let cls = new classBox(new collegeClass(name, "This is a class.", requiredClasses, uninitializedClasses), fabricCanvas);
        fabricCanvas.add(cls.group);
        activeClasses.push(cls.collegeClass); 


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
                        {classes.map((cls, index) => (
                            <ListItem
                                key={index}
                                addObject={addObject}
                                name={cls.name}
                                req={cls.req}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        
    );
  }