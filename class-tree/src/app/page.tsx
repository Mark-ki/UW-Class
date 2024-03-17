import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.appWrapper}>
        <h1 className={styles.title}>
          Plan out your classes
        </h1>
        <Link href="main" className={styles.buttonWrapper}><button className={styles.startButton}>Get started</button></Link>
        {/* <Image src="/bst.png" alt="Image" width={250} height={200} /> */}
        <p className={styles.disclaimerP}>
          <span>Disclaimer<br></br></span>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        </p>
      </div>
    </main>
  )
}
