import { Download } from 'lucide-react';
import styles from '../styles/components/PdfExport.module.css';

export function PdfExport() {
  return (
    <button
      className={styles.button}
      onClick={() => window.print()}
      aria-label="Print or save as PDF"
      title="Save as PDF"
    >
      <Download size={16} />
      <span className={styles.text}>Resume PDF</span>
    </button>
  );
}
