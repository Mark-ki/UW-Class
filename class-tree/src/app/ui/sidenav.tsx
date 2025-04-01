import React from 'react';
import styles from './styles.module.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
// import 'bootstrap/dist/js/bootstrap.min.js';

const SideNav = () => {
    return (
        <div className={styles.sideNavContainer + " bg-gradient-to-r from-red-800 via-red-700 to-red-900"}>
            <nav className={styles.sideNavWrapper}>
                <div className={styles.homeContainer}><div className={styles.homeWrapper}><Link className={styles.sideNavButtons} href="/">Home</Link></div></div>
                <div className={styles.aboutContainer}><div className={styles.aboutWrapper}><Link className={styles.sideNavButtons} href="about">About</Link></div></div>
            </nav>
            <div>
                <button className={styles.sideNavButton}>Sign In</button>
            </div>
        </div>
    );
};

export default SideNav;

