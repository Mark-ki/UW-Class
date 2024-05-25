'use client';

import "../globals.css"
import mainStyles from '../page.module.css'
import styles from '../about/styles.module.css';
import sideNavStyles from '../ui/styles.module.css';

import React, { use, useEffect, useState } from 'react';

const MouseEffect: React.FC = () => {

    useEffect(() => {
        const cursor = document.querySelector('#cursor');
        const mainWrapper = document.querySelector('.' + mainStyles.main);
        if (cursor && mainWrapper) {
            mainWrapper.setAttribute("style", "cursor: none;");
            document.addEventListener('mousemove', (e) => {
                // if(e.target as HTMLElement) {
                //     if((e.target as HTMLElement).classList.contains(sideNavStyles.sideNavContainer)) {
                //         console.log("sideNavContainer");
                //         return;
                //     }
                // }
                cursor.setAttribute("style", "top: " + (e.pageY - 10) + "px; left: " + (e.pageX - 10) + "px;");
                // body.style.backgroundPositionX = (e.pageX / 2) + "px";
                // body.style.backgroundPositionY = (e.pageY / 2) + "px";
                mainWrapper.setAttribute("style", "background-position-x: " + (e.pageX / 2) + "px; background-position-y: " + (e.pageY / 2) + "px;");
                
                // let elements = document.querySelectorAll("." + styles.Wrapper);
                // if(elements.length > 0) {
                //     elements.forEach((element) => {
                //         console.log(element);
                //         element.setAttribute("style", "top: " + (e.pageY - 50) + "px; left: " + (e.pageX - 500)+ "px;");
                //     });
                // }
                
                let effectEl = document.createElement("div");
                effectEl.setAttribute("class", "effect");
                mainWrapper.prepend(effectEl);

                effectEl.style.left = cursor.getBoundingClientRect().x + 3 + "px";
                effectEl.style.top = cursor.getBoundingClientRect().y + 3 + "px";
                


                setTimeout(() => {
                    // let effects = document.querySelectorAll(".effect")[0] as HTMLElement,
                    let directionX = Math.random() < .5 ? -1 : 1,
                    directionY = Math.random() < .5 ? -1 : 1;
                    
                    effectEl.style.left = parseInt(effectEl.style.left) - (directionX * Math.random() * 100) + "px";
                    effectEl.style.top = parseInt(effectEl.style.top) - (directionY * Math.random() * 100) + "px";
                    effectEl.style.top = parseInt(effectEl.style.top) + 50 + Math.random() * 50 + "px";
                    effectEl.style.opacity = "0";
                    effectEl.style.transform = "scale(0.25)";

                    setTimeout(() => {
                        effectEl.remove();
                    }, 1000 + Math.random() * 1000);
                }, 0);
            });
        }
    }, []);

    return (
    <div id="cursor">

    </div>);
};

export default MouseEffect;
