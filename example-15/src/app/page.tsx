import Link from 'next/link';

import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav>
          <ul>
            <li>
              <Link href="/minimal">Minimal</Link>
            </li>
            <li>
              <Link href="/minimal-reconnect">Minimal Reconnect</Link>
            </li>
            <li>
              <Link href="/even-odd">Even Odd</Link>
            </li>
            <li>
              <Link href="/advanced">Disconnect</Link>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
