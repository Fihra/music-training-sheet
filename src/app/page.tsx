import styles from "./page.module.css";
import About from "./components/About";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Music Training</h1>
      <About/>
    </div>
  );
}
