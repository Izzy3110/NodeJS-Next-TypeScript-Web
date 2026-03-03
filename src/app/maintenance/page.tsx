import React from 'react';
import styles from './maintenance.module.scss';

export default function MaintenancePage() {
  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.overlay}></div>
      <div className={styles.contentCard}>
        <h1 className={styles.title}>TakeOff Restaurant</h1>
        <div className={styles.statusBadge}>Under Maintenance</div>
        <p className={styles.subtitle}>
          We&apos;re currently perfecting our recipes and upgrading our systems.
          <br />
          We&apos;ll be back shortly to take off with you!
        </p>
        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} L&S Design. All rights reserved.
        </div>
      </div>
    </div>
  );
}
