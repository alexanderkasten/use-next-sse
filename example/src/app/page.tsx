import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav>
          <ul>
            <li><Link href="/minimal">Exmaple 1</Link></li>
            <li><Link href="/normal">Example 2</Link></li>
            <li><Link href="/advanced">Example 3</Link></li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
