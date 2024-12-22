import Counter from "./components/Counter";
import Counter2 from "./components/Counter2";
import StreamResponse from "./components/StreamResponse";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
          <li>
            {/* <Counter /> */}
            {/* <StreamResponse /> */}
            <Counter2 />
          </li>
        </ol>
      </main>
    </div>
  );
}
