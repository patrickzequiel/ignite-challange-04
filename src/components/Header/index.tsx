import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <>
      <header className={styles.container}>
        <div className={styles.container__content}>
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={238.62}
              height={25.63}
            />
          </Link>
        </div>
      </header>
    </>
  );
}
