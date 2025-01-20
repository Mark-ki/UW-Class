'use client';
import React, { useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { fabric } from 'fabric';
import { Group } from 'fabric/fabric-impl';

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

export default function Page() {
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // console.log("start")
            const ctx = canvas.getContext('2d');
            // console.log("middle")
            if (ctx) {

                var prereqLine = fabric.util.createClass({
                    initialize: function(start: Group, end: Group) {
                        this.start = start;
                        this.end = end;
                        // console.log(end)
                        this.line = new fabric.Line([start.left || 0, start.top || 0, end.left || 0, end.top || 0], {
                            stroke: 'rgba(0, 0, 0, 1)',
                            strokeWidth: 2,
                            // strokeDashArray: [10],
                            selectable: false

                        });

                        this.start.on('moving', (e) => {
                            this.line.set({ y1: this.start.top + 50, x1: this.start.left + 100 });
                        });

                        this.end.on('moving', (e) => {
                            this.line.set({ y2: this.end.top + 50, x2: this.end.left + 100 });
                        });
                    }
                });

                var classBox = fabric.util.createClass({
                    initialize: function(collegeClass: collegeClass) {
                        this.collegeClass = collegeClass;
                        this.width = 200;
                        this.height = 100;
                        this.fill = 'rgba(100, 20, 20, 1)';
                        this.text = new fabric.Text(collegeClass.name, { 
                            left: 10,
                            top: 10,
                            fill: 'rgba(255, 255, 255, 1)' // Change the color to blue
                        });
                        this.rect = new fabric.Rect({
                            fill: 'rgba(165, 0, 33, 1)',
                            left: 0,
                            top: 0,
                            width: this.width,
                            height: this.height,
                            rx: 5,
                            ry: 5
                        });
                        this.group = new fabric.Group([ this.rect, this.text ], {
                            left: 0,
                            top: 0,
                            hasControls: false
                        });

                        collegeClass.box = this.group;
                        this.lines = [];
                        // console.log(collegeClass)
                        for(var i = 0; i < collegeClass.prereq.length; i++){
                            console.log(collegeClass.prereq[0]);
                            this.lines.push(new prereqLine(this.group, collegeClass.prereq[i].box || new fabric.Group()));
                            // console.log(this.lines[i].top, this.lines[i].left);
                            fabricCanvas.add(this.lines[i].line);
                        }



                        this.group.on('moving', (e) => {
                            // for(var i = 0; i < collegeClass.prereq.length; i++){
                            //     this.lines[i].set({ y1: this.group.top + 50, x1: this.group.left + 100 });
                            // }
                            this.rect.set({ fill: 'rgba(153, 0, 31, 1)' });
                            if(!this.isMoving){
                                this.group.set({
                                    scaleX: this.group.scaleX * 1.1,
                                    scaleY: this.group.scaleY * 1.1
                                });
                            }
                            this.isMoving = true;

                        });

                        fabricCanvas.on('mouse:up',  (event) => {
                            if(this.isMoving){
                                this.rect.set({ fill: 'rgba(165, 0, 33, 1)' });
                                // this.group.set({ opacity: 1 });
                                this.isMoving = false;
                                this.group.set({
                                    scaleX: this.group.scaleX * 1/1.1,
                                    scaleY: this.group.scaleY * 1/1.1
                                });
                            } 
                        });

                        // if(this.collegeClass.box != null){
                        //     this.childBox = this.collegeClass.box.group
                        //     this.childBox.on('moving', (e) => {
                        //         this.lines[0].set({ y2: this.childBox.top + 50, x2: this.childBox.left + 100 });
                        //     });
                        // }
                    }
                  });

                const fabricCanvas = new fabric.Canvas("myCanvas");
                fabricCanvas.selection = false;
                fabricCanvas.setHeight(window.innerHeight*4/5);
                fabricCanvas.setWidth(window.innerWidth*12/13);
                fabricCanvas.setBackgroundColor('rgba(255, 255, 255, 1)', fabricCanvas.renderAll.bind(fabricCanvas));

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
                      

                  var cs200 = new classBox(new collegeClass("CS 200", "This is a class."));
                var cs300 = new classBox(new collegeClass("CS 300", "This is a class.", [cs200.collegeClass]));
                var cs400 = new classBox(new collegeClass("CS 400", "This is a class.", [cs300.collegeClass]));
                var math354 = new classBox(new collegeClass("Math 354", "This is a class.", [cs400.collegeClass]));
                var cs577 = new classBox(new collegeClass("CS 577", "This is a class.", [cs400.collegeClass, math354.collegeClass]));
                // fabricCanvas.add(cs400.lines[0]);
                // fabricCanvas.add(math354.lines[0]);
                fabricCanvas.add(cs300.group);
                fabricCanvas.add(cs400.group);
                fabricCanvas.add(math354.group);
                fabricCanvas.add(cs200.group);
                fabricCanvas.add(cs577.group);
            }
        }
    }, []);

    return (
        <div className={styles.Wrapper}>
            {/* <p className={styles.label}>This is the main page.</p> */}
            <canvas className={styles.canvas} ref={canvasRef} id="myCanvas"></canvas>
            <div className='w-24 h-full bg-red-500'>

            </div>
        </div>
        
    );
  }