import styles from "./page.module.css";
import About from "./components/About";
import PitchTest from "./components/PitchTest";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Music Training</h1>
      <About/>
      <PitchTest/>
    </div>
  );
}
